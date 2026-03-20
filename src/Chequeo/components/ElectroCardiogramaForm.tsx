import { Box, Grid, Paper, Typography } from "@mui/material";
import electroCardiogramaJson from '../config/electro-form.json';
import { ButtonsForm, InputSelect, InputText } from "../../components";
import useElectroCardiograma from "../hooks/useElectroCardiograma";
import Swal from 'sweetalert2';
import { UseElectroCardiogranaService } from "../services/useElectroCardiogranaService";
import { useEffect, useState } from "react";

interface Props {
  rut_paciente: string;
  id_paciente: number;
  url_pdf?: string;
  handleUpdateStatus: (status: number, rut_paciente: string, id_paciente: number) => void;
}

export const ElectroCardiogramaForm = ({ rut_paciente, url_pdf, id_paciente, handleUpdateStatus }: Props) => {
  const { control, handleSubmit, setValue, errors } = useElectroCardiograma();
  const [response, setResponse] = useState<any>(null);

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
  };

  return (
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
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/** Datos principales en filas responsivas */}
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
                    <Typography variant="caption" color="textSecondary">{label}</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={4} alignItems="flex-start" justifyContent="center">
        {/* PDF / Imagen */}
        <Grid item xs={12} md={8} sx={{ textAlign: "center" }}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              height: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
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
                <ButtonsForm onSubmit={onSubmit} title="Confimar" btnStatus={false} />
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};