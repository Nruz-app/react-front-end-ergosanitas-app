import { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, IconButton, InputAdornment, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';

import { LoginContext } from '../../common/context';

import { DialogoImagen, FiltroSecciones, TarjetaImagen } from '../components';
import { IMAGENES_POR_PAGINA, SECCIONES_IMAGEN } from '../config/imagenes-home';
import { COLORES, IMAGENES, UI, sxFocoVisible, sxTarjeta } from '../config/tema';
import type { IImagenHome, IImagenHomeForm, SeccionImagenHome } from '../interface';
import { UseImagenesHomeService } from '../services';
import { escaparHtml } from '../utilities';

/** Columnas de la grilla: tarjetas de al menos 200 px, tantas como quepan. */
const GRILLA = {
    display             : 'grid',
    gridTemplateColumns : 'repeat(auto-fill, minmax(200px, 1fr))',
    gap                 : 2,
};

/** Un mensaje centrado para los estados en los que no hay grilla que pintar. */
const Aviso = ({ titulo, detalle, accion }: {
    titulo : string; detalle: string; accion?: ReactNode;
}) => (

    <Box sx={{ ...sxTarjeta, p: 5, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: COLORES.primarioOsc, mb: 0.75 }}>
            { titulo }
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: accion ? 2 : 0 }}>
            { detalle }
        </Typography>
        { accion }
    </Box>
);

/**
 * El orden en que el back entrega la lista: sección (promoción, alianza, galería), `orden` e `id`.
 * Se reaplica al agregar o editar, porque ambas cosas pueden mover la carta de sitio.
 */
const ordenarImagenes = (lista: IImagenHome[]): IImagenHome[] =>
    [...lista].sort((a, b) =>
        SECCIONES_IMAGEN.indexOf(a.seccion) - SECCIONES_IMAGEN.indexOf(b.seccion)
        || a.orden - b.orden
        || a.id - b.id);

/** Minúsculas y sin tildes, para que «galeria» encuentre «Galería». */
const normalizar = (texto: string): string =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface Props {
    /**
     * `true` mientras este tab está a la vista.
     *
     * `TabPanel` oculta con `display: none` sin desmontar (§4 de la guía). Sin esta señal, la
     * lista de imágenes se pediría nada más entrar el Administrador al módulo, aunque nunca
     * abriera esta pestaña. Se pide en la **primera** activación y no se repite al volver.
     */
    activo : boolean;
}

/**
 * Tab «Imágenes del Home» (Spec 02): las promociones, alianzas y fotos de galería que pinta la
 * portada pública, como una grilla de cartas.
 *
 * Es la forma de `JuegoCartasPage` de Colegios —grilla, chips de filtro, buscador y «Ver más»—
 * clonada sin su contenido clínico (regla dura 1). El filtrado es **en memoria**: son decenas de
 * imágenes en una sola respuesta, y el orden es el que entrega el back (sección y `orden`).
 *
 * Una sola lista `imagenes` guarda el estado. Las acciones de los pasos siguientes la actualizan
 * con la fila que devuelve el back, sin recargarla entera.
 */
export const ImagenesHomePage = ({ activo }: Props) => {

    const { user } = useContext(LoginContext);

    const [imagenes, setImagenes] = useState<IImagenHome[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const [texto, setTexto] = useState('');
    const [seccion, setSeccion] = useState<SeccionImagenHome | ''>('');
    const [visibles, setVisibles] = useState(IMAGENES_POR_PAGINA);

    /**
     * Ids con un `PUT .../activo` en vuelo. Su botón se deshabilita: un doble clic enviaría dos
     * peticiones con el mismo valor y la segunda podría llegar antes que la primera.
     */
    const [cambiandoActivo, setCambiandoActivo] = useState<number[]>([]);

    /**
     * La guardia real del doble clic. El estado de arriba solo pinta el botón deshabilitado; dos
     * clics que llegan antes del siguiente render verían los dos el estado viejo. Un `useRef` se
     * actualiza al instante.
     */
    const activoEnVuelo = useRef(new Set<number>());

    /**
     * Diálogo de alta/edición. `editando` en `null` con el diálogo abierto es «Agregar»; con una
     * imagen, «Editar». `guardando` bloquea el diálogo mientras el `POST`/`PUT` está en vuelo.
     */
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<IImagenHome | null>(null);
    const [guardando, setGuardando] = useState(false);

    /**
     * Ids con un `DELETE` en vuelo. Mientras la petición viaja, la carta sigue en la grilla y un
     * segundo clic en «Eliminar» abriría otra confirmación que terminaría en un 404.
     */
    const eliminandoEnVuelo = useRef(new Set<number>());

    /** Guardia del doble envío (un Enter repetido antes del render), como `activoEnVuelo`. */
    const guardandoEnVuelo = useRef(false);

    /**
     * Turno de la carga: solo la respuesta de la última petición escribe (patrón del módulo, §5
     * de la guía). Sin esto, pulsar «Reintentar» con una carga lenta en vuelo podía pintar la
     * respuesta vieja encima de la nueva.
     */
    const turnoImagenes = useRef(0);

    /** Si la lista ya se pidió alguna vez. La carga diferida ocurre una sola vez. */
    const cargadaUnaVez = useRef(false);

    /** Solo usa refs y setters: es estable, y así el `useEffect` puede declararla sin silenciar la regla. */
    const cargar = useCallback(async () => {

        const turno = ++turnoImagenes.current;

        setCargando(true);
        setError('');

        try {
            const { getImagenesAdmin } = await UseImagenesHomeService();
            const filas = await getImagenesAdmin();

            if (turno !== turnoImagenes.current) return;

            setImagenes(filas);
        }
        catch (problema) {
            if (turno !== turnoImagenes.current) return;

            console.error('Error al cargar las imágenes del Home:', problema);
            setError(problema instanceof Error ? problema.message : 'No hay respuesta del servidor.');
        }
        finally {
            if (turno === turnoImagenes.current) setCargando(false);
        }
    }, []);

    useEffect(() => {

        if (!activo || cargadaUnaVez.current) return;

        cargadaUnaVez.current = true;
        cargar();

    }, [activo, cargar]);

    const conteos = useMemo(() => {

        const cuenta = { promocion: 0, alianza: 0, galeria: 0 } as Record<SeccionImagenHome, number>;

        for (const imagen of imagenes) {
            if (SECCIONES_IMAGEN.includes(imagen.seccion)) cuenta[imagen.seccion] += 1;
        }

        return cuenta;
    }, [imagenes]);

    const filtradas = useMemo(() => {

        const buscado = normalizar(texto.trim());

        return imagenes.filter((imagen) => {

            if (seccion !== '' && imagen.seccion !== seccion) return false;
            if (!buscado) return true;

            return normalizar(`${imagen.caption ?? ''} ${imagen.alt}`).includes(buscado);
        });
    }, [imagenes, texto, seccion]);

    /** Cualquier cambio de filtro vuelve a la primera tanda, como en `JuegoCartasPage`. */
    const filtrar = (aplicar: () => void) => {
        aplicar();
        setVisibles(IMAGENES_POR_PAGINA);
    };

    /** Reemplaza una imagen de la lista por la versión que devolvió el back, sin recargar. */
    const reemplazar = (actualizada: IImagenHome) =>
        setImagenes((actuales) => ordenarImagenes(
            actuales.map((imagen) => (imagen.id === actualizada.id ? actualizada : imagen)),
        ));

    const temaMui = useTheme();

    /**
     * Sube el Swal por encima del `Dialog` de MUI. Swal trae `z-index: 1060` y el `Dialog` 1300:
     * sin esto el error de un guardado fallido salía **detrás** del diálogo, que sigue abierto, y
     * el usuario no veía por qué no se guardó. `willOpen` corre antes de pintarse.
     */
    const sobreElDialogo = () => {
        const contenedor = Swal.getContainer();
        if (contenedor) contenedor.style.zIndex = String(temaMui.zIndex.modal + 1);
    };

    /** Muestra el error del back en un Swal. La grilla queda como estaba. */
    const avisarError = (titulo: string, problema: unknown) => {
        console.error(`${titulo}:`, problema);
        Swal.fire({
            icon     : 'error',
            title    : titulo,
            text     : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
            willOpen : sobreElDialogo,
        });
    };

    /**
     * Ocultar / mostrar. La carta cambia **cuando responde el back**, con la fila que devuelve, y
     * no antes: si el back lo rechaza (403, 500) la carta no miente sobre lo que ve el Home.
     */
    const handleActivo = async (imagen: IImagenHome) => {

        if (activoEnVuelo.current.has(imagen.id)) return;

        activoEnVuelo.current.add(imagen.id);
        setCambiandoActivo((ids) => [...ids, imagen.id]);

        try {
            const { putActivo } = await UseImagenesHomeService();
            reemplazar(await putActivo(imagen.id, !imagen.activo, user.user_email));
        }
        catch (problema) {
            avisarError(imagen.activo ? 'No se pudo ocultar la imagen' : 'No se pudo mostrar la imagen', problema);
        }
        finally {
            activoEnVuelo.current.delete(imagen.id);
            setCambiandoActivo((ids) => ids.filter((id) => id !== imagen.id));
        }
    };

    const handleAgregar = () => {
        setEditando(null);
        setDialogoAbierto(true);
    };

    const handleEditar = (imagen: IImagenHome) => {
        setEditando(imagen);
        setDialogoAbierto(true);
    };

    const handleCerrarDialogo = () => {
        if (!guardando) setDialogoAbierto(false);
    };

    /**
     * Guarda el diálogo. Si sale bien, la carta entra (o cambia) con la fila que devolvió el back
     * y el diálogo se cierra; si falla, se avisa y el diálogo **queda abierto** con lo escrito.
     */
    const handleGuardar = async (form: IImagenHomeForm) => {

        if (guardandoEnVuelo.current) return;

        guardandoEnVuelo.current = true;
        setGuardando(true);

        try {
            const { postImagen, putImagen } = await UseImagenesHomeService();

            if (editando) {
                reemplazar(await putImagen(editando.id, form, user.user_email));
            }
            else {
                const nueva = await postImagen(form, user.user_email);
                setImagenes((actuales) => ordenarImagenes([...actuales, nueva]));
            }

            setDialogoAbierto(false);

            Swal.fire({
                icon              : 'success',
                title             : editando ? 'Imagen actualizada' : 'Imagen agregada',
                timer             : 1600,
                showConfirmButton : false,
                // El diálogo aún se está desvaneciendo: sin esto el aviso nace detrás de él.
                willOpen          : sobreElDialogo,
            });
        }
        catch (problema) {
            avisarError(editando ? 'No se pudo actualizar la imagen' : 'No se pudo agregar la imagen', problema);
        }
        finally {
            guardandoEnVuelo.current = false;
            setGuardando(false);
        }
    };

    /**
     * Eliminar (paso 8): el borrado es **irreversible** —el back borra la fila y el archivo—, a
     * diferencia de ocultar. La confirmación muestra la miniatura y el título para que no se
     * borre la carta equivocada, y ofrece ocultar como alternativa en el texto.
     *
     * Todo lo que va al `html:` de Swal pasa por `escaparHtml`: el caption y el alt los escribe
     * un usuario, y la `src` también se escapa porque va dentro de un atributo.
     */
    const handleEliminar = async (imagen: IImagenHome) => {

        if (eliminandoEnVuelo.current.has(imagen.id)) return;

        const titulo = imagen.caption || imagen.alt;

        const resultado = await Swal.fire({
            title             : '⚠️ ¿Eliminar esta imagen?',
            html              : `
                <img src="${escaparHtml(imagen.src)}" alt="${escaparHtml(imagen.alt)}"
                     style="width:120px;aspect-ratio:2/3;object-fit:contain;border-radius:8px;background:${IMAGENES.fondoMarco};display:block;margin:0 auto 12px;" />
                <b>${escaparHtml(titulo)}</b><br>
                <span style="font-size:14px;">Se borra del Home y del servidor, y no se puede deshacer.
                Si solo quieres sacarla un tiempo, ocúltala.</span>`,
            icon              : 'warning',
            showCancelButton  : true,
            confirmButtonColor: UI.peligro,
            cancelButtonColor : UI.cancelar,
            confirmButtonText : 'Sí, eliminar',
            cancelButtonText  : 'Cancelar',
            reverseButtons    : true,
            focusCancel       : true,
        });

        if (!resultado.isConfirmed || eliminandoEnVuelo.current.has(imagen.id)) return;

        eliminandoEnVuelo.current.add(imagen.id);

        try {
            const { deleteImagen } = await UseImagenesHomeService();
            await deleteImagen(imagen.id, user.user_email);

            // La carta sale de la lista sin recargarla: los conteos del filtro se recalculan solos.
            setImagenes((actuales) => actuales.filter((actual) => actual.id !== imagen.id));

            Swal.fire({
                icon              : 'success',
                title             : 'Imagen eliminada',
                timer             : 1600,
                showConfirmButton : false,
            });
        }
        catch (problema) {
            avisarError('No se pudo eliminar la imagen', problema);
        }
        finally {
            eliminandoEnVuelo.current.delete(imagen.id);
        }
    };

    const cabecera = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                Las promociones, alianzas y fotos de galería que muestra la página de inicio.
                Una imagen oculta no se ve en el Home, pero se puede volver a mostrar.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    value={texto}
                    onChange={(evento) => filtrar(() => setTexto(evento.target.value))}
                    placeholder="Buscar por título o texto alternativo"
                    inputProps={{ 'aria-label': 'Buscar imágenes por título o texto alternativo' }}
                    sx={{ minWidth: { xs: '100%', sm: 320 }, backgroundColor: COLORES.fondoTarjeta }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: texto ? (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    aria-label="Limpiar la búsqueda"
                                    onClick={() => filtrar(() => setTexto(''))}
                                    sx={sxFocoVisible}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined,
                    }}
                />

                <Button
                    variant="contained"
                    startIcon={<AddPhotoAlternateIcon />}
                    onClick={handleAgregar}
                    sx={{ ml: { sm: 'auto' }, ...sxFocoVisible }}
                >
                    Agregar imagen
                </Button>
            </Box>

            <FiltroSecciones
                seleccionada={seccion}
                conteos={conteos}
                handleElegir={(nueva) => filtrar(() => setSeccion(nueva))}
            />
        </Box>
    );

    const contenido = () => {

        if (cargando && imagenes.length === 0) {
            return (
                <Box sx={GRILLA} aria-busy="true" aria-label="Cargando imágenes">
                    { Array.from({ length: 8 }, (_, n) => (
                        <Skeleton key={n} variant="rounded" sx={{ height: 'auto', aspectRatio: '2 / 3.9', borderRadius: 3 }} />
                    )) }
                </Box>
            );
        }

        if (error) {
            return (
                <Aviso
                    titulo="No se pudieron cargar las imágenes"
                    detalle={error}
                    accion={
                        <Button variant="contained" onClick={cargar} sx={sxFocoVisible}>
                            Reintentar
                        </Button>
                    }
                />
            );
        }

        if (imagenes.length === 0) {
            return (
                <Aviso
                    titulo="Todavía no hay imágenes"
                    detalle="Cuando agregues una promoción, una alianza o una foto de galería aparecerá aquí."
                />
            );
        }

        if (filtradas.length === 0) {
            return (
                <Aviso
                    titulo="Ninguna imagen coincide"
                    detalle="Prueba con otra palabra o elige otra sección."
                    accion={
                        <Button
                            variant="outlined"
                            onClick={() => filtrar(() => { setTexto(''); setSeccion(''); })}
                            sx={sxFocoVisible}
                        >
                            Quitar filtros
                        </Button>
                    }
                />
            );
        }

        return (
            <>
                <Box sx={GRILLA}>
                    { filtradas.slice(0, visibles).map((imagen) => (
                        <TarjetaImagen
                            key={imagen.id}
                            imagen={imagen}
                            cambiandoActivo={cambiandoActivo.includes(imagen.id)}
                            handleActivo={handleActivo}
                            handleEditar={handleEditar}
                            handleEliminar={handleEliminar}
                        />
                    )) }
                </Box>

                { visibles < filtradas.length && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setVisibles((actual) => actual + IMAGENES_POR_PAGINA)}
                            sx={sxFocoVisible}
                        >
                            Ver más ({ filtradas.length - visibles } restantes)
                        </Button>
                    </Box>
                )}
            </>
        );
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            { cabecera }
            { contenido() }

            <DialogoImagen
                abierto={dialogoAbierto}
                imagen={editando}
                guardando={guardando}
                handleCerrar={handleCerrarDialogo}
                handleGuardar={handleGuardar}
            />
        </Box>
    );
};
