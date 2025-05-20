import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Typography, 
  Paper, 
  Container, 
  CircularProgress,
  Alert 
} from '@mui/material';
import './InspeccionPage.css';

function CreateInspeccionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    INS_VEH_VEHICULO_ID: '',
    INS_FECHA_INSPECCION: '',
    INS_TIPO_INSPECCION: 'Periódica',
    INS_ESTADO: 'Pendiente'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateForOracle = (dateString) => {
    if (!dateString) return null;
    
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const [year, month, day] = dateString.split('-');
    return `${day}-${months[parseInt(month) - 1]}-${year}`; // Formato: 15-DIC-2023
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validación de campos requeridos
    if (!formData.INS_VEH_VEHICULO_ID || !formData.INS_FECHA_INSPECCION) {
      setError('El ID del vehículo y la fecha son requeridos');
      setIsSubmitting(false);
      return;
    }

    // Payload con formato de fecha corregido para Oracle
    const payload = {
      vehiculoId: Number(formData.INS_VEH_VEHICULO_ID),
      fechaInspeccion: formatDateForOracle(formData.INS_FECHA_INSPECCION),
      tipoInspeccion: formData.INS_TIPO_INSPECCION,
      estado: formData.INS_ESTADO
    };

    console.log('Payload enviado:', payload); // Para verificación

    try {
      const response = await axios.post('http://localhost:3001/inspecciones-tecnicas', payload);
      console.log('Inspección creada:', response.data);
      navigate('/inspecciones');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         err.message || 
                         'Error al crear inspección';
      setError(errorMessage);
      console.error('Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva Inspección Técnica
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vehículo ID */}
          <TextField
            label="ID del Vehículo"
            name="INS_VEH_VEHICULO_ID"
            value={formData.INS_VEH_VEHICULO_ID}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          {/* Fecha de Inspección */}
          <TextField
            label="Fecha de Inspección"
            name="INS_FECHA_INSPECCION"
            type="date"
            value={formData.INS_FECHA_INSPECCION}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          {/* Tipo de Inspección */}
          <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
            <InputLabel>Tipo de Inspección</InputLabel>
            <Select
              name="INS_TIPO_INSPECCION"
              value={formData.INS_TIPO_INSPECCION}
              onChange={handleChange}
              label="Tipo de Inspección"
            >
              {['Periódica', 'Inicial', 'Extraordinaria', 'Preoperacional'].map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Estado */}
          <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              name="INS_ESTADO"
              value={formData.INS_ESTADO}
              onChange={handleChange}
              label="Estado"
            >
              {['Pendiente', 'Aprobado', 'Rechazado', 'En Proceso'].map((estado) => (
                <MenuItem key={estado} value={estado}>{estado}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/inspecciones-tecnicas')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateInspeccionPage;
