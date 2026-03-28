import { Box, Grid, Paper, Typography } from "@mui/material";
import electroCardiogramaJson from '../config/electro-form.json';
import { ButtonsForm, InputSelect, InputText } from "../../components";
import useElectroCardiograma from "../hooks/useElectroCardiograma";
import Swal from 'sweetalert2';
import { UseElectroCardiogranaService } from "../services/useElectroCardiogranaService";
import { useContext, useEffect, useState } from "react";
import { ValidateDialog } from "./modal/validate-dialog";
import { PreviewFileDialog } from "./modal/preview-file";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { LoginContext } from "../../common/context";

interface Props {
  rut_paciente: string;
  id_paciente: number;
  url_pdf?: string;
  handleUpdateStatus: (status: number, rut_paciente: string, id_paciente: number) => void;
}

export const ElectroCardiogramaForm = ({ rut_paciente, url_pdf, id_paciente, handleUpdateStatus }: Props) => {
  
  const { user }  = useContext( LoginContext );
  const { user_perfil }  = user;
  
  
  
  const { control, handleSubmit, setValue, errors } = useElectroCardiograma();
  const [response, setResponse] = useState<any>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  
  let extension = 'jpg';
  if (url_pdf) {
    const path = url_pdf.split('.');
    extension = path[path.length - 1].toLowerCase();
  }

  useEffect(() => {
    if (!id_paciente) return;

    const fetchChequeoCardiovascular = async () => {
      try {
        const { getChequeoCardiovascular } = await UseElectroCardiogranaService();
        const resp = await getChequeoCardiovascular(id_paciente);
        setResponse(resp);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChequeoCardiovascular();
  }, [id_paciente]);

  const handleValidate = async (ergoPass: string) => {
    try {
      const { userUpdateErgoPass } = await UseElectroCardiogranaService();

      const resp = await userUpdateErgoPass(ergoPass);

      if (!resp) {
        Swal.fire({
          icon: "error",
          title: "Validación Ergo Pass",
          text: "Ingrese un Ergo Pass válido para continuar",
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      setOpenDialog(false);
      await onSubmit();

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error en validación", "error");
    }
  }

  const onSubmit = async () => {

    const hasErrors = errors && Object.values(errors).some(Boolean);
    if (hasErrors) {
      Swal.fire({
        icon: 'error',
        title: 'Error al ingresar Electrocardiograma',
        text: 'Por favor ingrese todos los valores del formulario',
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const { postCreateElectroCardiograma } = await UseElectroCardiogranaService();
    const { estado_paciente, frecuencia_cardiaca_paciente, derivacion_paciente, observacion_paciente, imc_paciente } = control._formValues || {};

    const resp = await postCreateElectroCardiograma({
      rut_paciente,
      id_paciente,
      estado_paciente,
      frecuencia_cardiaca_paciente,
      derivacion_paciente,
      observacion_paciente,
      imc_paciente
    });

    if (resp) {
      Swal.fire('Paciente Listo', `El paciente ${rut_paciente} fue ingresado con éxito`, 'success');
      control._reset();
      handleUpdateStatus(0, '', 0);
    }
  }

  return (
  <>  
    <Box sx={{ flexGrow: 1, maxWidth: "100%" }}>

      {/* CABECERA PACIENTE */}
      {response && (
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#f5f7fa 0%,#e4ecf7 100%)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            }
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {Object.entries({
                  Nombre: response.nombre,
                  Edad: response.edad,
                  "Presión Arterial": `${response.presion_sistolica}/${response.presionArterial}`,
                  "Glicemia Capilar": response.hemoglucotest,
                  Peso: `${response.peso} kg`,
                  Altura: `${response.estatura} cm`,
                  IMC: response.imc_paciente,
                  "Enfermedades Crónicas": response.enfermedadesCronicas,
                  Medicamentos: response.medicamentosDiarios
                }).map(([label, value]) => (
                  <Grid item xs={12} sm={6} md={3} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={4} alignItems="flex-start" justifyContent="center">

        {/* VISOR PDF / IMAGEN */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={4}
            onClick={() => setOpenPreview(true)}
            sx={{
              position: "relative",
              cursor: "zoom-in",
              borderRadius: 3,
              overflow: 'hidden',
              height: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              },
              "&:hover .overlay": {
                opacity: 1,
              }
            }}
          >

            {/* CONTENIDO */}
            {extension === 'pdf' ? (
              <iframe
                src={url_pdf}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Vista previa del PDF"
              />
            ) : (
              <img
                src={url_pdf}
                alt="Vista previa"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            )}

            {/* OVERLAY */}
            <Box
              className="overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.45)",
                opacity: 0,
                transition: "opacity 0.3s ease",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                flexDirection: "column",
                gap: 1
              }}
            >
              <ZoomInIcon sx={{ fontSize: 55 }} />
              <Typography variant="h6">
                Ver en pantalla completa
              </Typography>
            </Box>

          </Paper>
        </Grid>

        {/* FORMULARIO */}
        <Grid item xs={12} md={4}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {electroCardiogramaJson
                .sort((a, b) => a.order - b.order)
                .map(({ type, name, placeholder, label, defaultValue, helperText, values, multiline }) => {
                  if (type === 'text' || type === 'number') {
                    return (
                      <Grid item xs={12} key={name}>
                        <InputText
                          control={control}
                          type={type}
                          name={name}
                          placeholder={placeholder}
                          label={label}
                          defaultValue={defaultValue}
                          helperText={helperText}
                          disabled={false}
                          multiline={multiline}
                        />
                      </Grid>
                    );
                  } else if (type === 'selected') {
                    return (
                      <Grid item xs={12} key={name}>
                        <InputSelect
                          control={control}
                          type={type}
                          name={name}
                          placeholder={placeholder}
                          label={label}
                          defaultValue={defaultValue}
                          helperText={helperText}
                          values={values!}
                          setValue={setValue}
                          disabled={false}
                        />
                      </Grid>
                    );
                  }
                  throw new Error(`El type: ${type} no es soportado`);
                })}
            </Grid>

            <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6}>
                <ButtonsForm
                  onSubmit={user_perfil === "Medicos" ? () => setOpenDialog(true) : onSubmit}
                  title="Confirmar"
                  btnStatus={false}
                />
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Box>

    <ValidateDialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      onConfirm={handleValidate}
    />

    <PreviewFileDialog
      open={openPreview}
      onClose={() => setOpenPreview(false)}
      url_pdf={url_pdf}
    />
  </>
  );
}