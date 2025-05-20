import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Button, 
  TextField, 
  MenuItem, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';

function EditInspeccionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    INS_VEH_VEHICULO_ID: '',
    INS_FECHA_INSPECCION: '',
    INS_TIPO_INSPECCION: 'Periódica',
    INS_ESTADO: 'Pendiente'
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatDateForOracle = (dateString) => {
    if (!dateString) return null;
    
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const [year, month, day] = dateString.split('-');
    return `${day}-${months[parseInt(month) - 1]}-${year}`;
  };

  useEffect(() => {
    const fetchInspeccion = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/inspecciones-tecnicas/${id}`);
        const data = response.data;
        
        setFormData({
          INS_VEH_VEHICULO_ID: data.vehiculoId || data.INS_VEH_VEHICULO_ID || '',
          INS_FECHA_INSPECCION: data.fechaInspeccion?.split('T')[0] || data.INS_FECHA_INSPECCION?.split('T')[0] || '',
          INS_TIPO_INSPECCION: data.tipoInspeccion || data.INS_TIPO_INSPECCION || 'Periódica',
          INS_ESTADO: data.estado || data.INS_ESTADO || 'Pendiente'
        });
      } catch (err) {
        console.error('Error al obtener inspección:', err);
        setError('No se pudo cargar la inspección');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInspeccion();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!formData.INS_VEH_VEHICULO_ID || !formData.INS_FECHA_INSPECCION) {
        throw new Error('El ID del vehículo y la fecha son requeridos');
      }

      const payload = {
        vehiculoId: Number(formData.INS_VEH_VEHICULO_ID),
        fechaInspeccion: formatDateForOracle(formData.INS_FECHA_INSPECCION),
        tipoInspeccion: formData.INS_TIPO_INSPECCION,
        estado: formData.INS_ESTADO
      };

      console.log('Enviando datos actualizados:', payload);
      
      const response = await axios.put(
        `http://localhost:3001/inspecciones-tecnicas/${id}`,
        payload
      );
      
      console.log('Cambios guardados:', response.data);
      navigate('/inspecciones');
    } catch (err) {
      console.error('Error al actualizar:', {
        message: err.message,
        response: err.response?.data,
      });
      setError(err.response?.data?.message || err.message || 'Error al guardar cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Inspección Técnica #{id}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Vehículo ID"
            name="INS_VEH_VEHICULO_ID"
            value={formData.INS_VEH_VEHICULO_ID}
            onChange={handleChange}
            required
            type="number"
            inputProps={{ min: 1 }}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Fecha de Inspección"
            type="date"
            name="INS_FECHA_INSPECCION"
            value={formData.INS_FECHA_INSPECCION}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          
          <FormControl fullWidth margin="normal" required>
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
          
          <FormControl fullWidth margin="normal" required>
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
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            
            <Button 
              variant="outlined"
              onClick={() => navigate('/inspecciones-tecnicas/')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default EditInspeccionPage;
