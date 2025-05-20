import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Container, 
  Typography, 
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Snackbar
} from '@mui/material';

function EditMaintenancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehiculoId: null,
    tipoMantenimiento: 'Preventivo',
    fechaMantenimiento: '',
    kilometrajeMantenimiento: '',
    descripcion: '',
    estado: 'Pendiente',
    costoTotal: '',
    repuestosUsados: ''
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);

  // Cargar lista de vehículos disponibles y datos del mantenimiento
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar vehículos
        const vehiculosResponse = await axios.get('http://localhost:3001/vehiculos');
        const vehiculosFormateados = vehiculosResponse.data.map(vehiculo => ({
          VEHICULO_ID: vehiculo.VEH_VEHICULO_ID,
          PLACA: vehiculo.VEH_PLACA,
          MARCA: vehiculo.VEH_MARCA,
          MODELO: vehiculo.VEH_MODELO,
          KILOMETRAJE: vehiculo.VEH_KILOMETRAJE_ACTUAL
        }));
        setVehiculos(vehiculosFormateados);

        // Cargar datos del mantenimiento
        const mantenimientoResponse = await axios.get(`http://localhost:3001/mantenimientos/${id}`);
        const mantenimientoData = mantenimientoResponse.data;
        
        // Convertir fecha de Oracle (DD-MON-YYYY) a YYYY-MM-DD para el input date
        const fechaParts = mantenimientoData.MAN_FECHA_MANTENIMIENTO.split('-');
        const meses = {
          'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04', 'MAY': '05', 'JUN': '06',
          'JUL': '07', 'AGO': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12'
        };
        const formattedDate = `${fechaParts[2]}-${meses[fechaParts[1].toUpperCase()]}-${fechaParts[0].padStart(2, '0')}`;

        setFormData({
          vehiculoId: mantenimientoData.MAN_VEH_VEHICULO_ID,
          tipoMantenimiento: mantenimientoData.MAN_TIPO_MANTENIMIENTO,
          fechaMantenimiento: formattedDate,
          kilometrajeMantenimiento: mantenimientoData.MAN_KILOMETRAJE_MANTENIMIENTO?.toString() || '',
          descripcion: mantenimientoData.MAN_DESCRIPCION || '',
          estado: mantenimientoData.MAN_ESTADO,
          costoTotal: mantenimientoData.MAN_COSTO_TOTAL?.toString() || '',
          repuestosUsados: mantenimientoData.MAN_REPUESTOS_USADOS || ''
        });

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.response?.data?.message || 'Error al cargar datos del mantenimiento');
      } finally {
        setIsLoading(false);
        setLoadingVehiculos(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vehiculoId') {
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }
    
    if (name === 'kilometrajeMantenimiento') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } 
    else if (name === 'costoTotal') {
      const decimalValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      setFormData(prev => ({ ...prev, [name]: decimalValue }));
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatDateForOracle = (dateString) => {
    if (!dateString) return null;
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const [year, month, day] = dateString.split('-');
    return `${day}-${months[parseInt(month) - 1]}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.vehiculoId) throw new Error('Seleccione un vehículo');
      if (!formData.tipoMantenimiento) throw new Error('Seleccione el tipo de mantenimiento');
      if (!formData.fechaMantenimiento) throw new Error('Ingrese la fecha del mantenimiento');

      // Crear payload con formato correcto
      const payload = {
        vehiculoId: Number(formData.vehiculoId),
        tipoMantenimiento: formData.tipoMantenimiento,
        fechaMantenimiento: formatDateForOracle(formData.fechaMantenimiento),
        kilometrajeMantenimiento: formData.kilometrajeMantenimiento ? 
          Number(formData.kilometrajeMantenimiento) : null,
        descripcion: formData.descripcion || null,
        estado: formData.estado,
        costoTotal: formData.costoTotal ? parseFloat(formData.costoTotal) : null,
        repuestosUsados: formData.repuestosUsados || null
      };

      console.log('Enviando payload:', payload);

      const response = await axios.put(
        `http://localhost:3001/mantenimientos/${id}`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);
      setSuccess('Mantenimiento actualizado exitosamente');
      setTimeout(() => navigate('/mantenimientos'), 1500);
    } catch (error) {
      console.error('Error completo:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Error al actualizar el mantenimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/mantenimientos')}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/mantenimientos')}
          sx={{ mb: 3 }}
        >
          ← Volver al listado
        </Button>

        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Editar Mantenimiento #{id}
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Selector de vehículos */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Vehículo</InputLabel>
            <Select
              name="vehiculoId"
              value={formData.vehiculoId || ''}
              onChange={handleChange}
              label="Vehículo"
              disabled={loadingVehiculos}
            >
              <MenuItem disabled value="">
                {loadingVehiculos ? 'Cargando vehículos...' : 'Seleccione un vehículo'}
              </MenuItem>
              {vehiculos.map(vehiculo => (
                <MenuItem 
                  key={vehiculo.VEHICULO_ID} 
                  value={vehiculo.VEHICULO_ID}
                >
                  {vehiculo.MODELO} - {vehiculo.PLACA} (KM: {vehiculo.KILOMETRAJE})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Resto de los campos del formulario */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Tipo de Mantenimiento</InputLabel>
            <Select
              name="tipoMantenimiento"
              value={formData.tipoMantenimiento}
              onChange={handleChange}
              label="Tipo de Mantenimiento"
            >
              <MenuItem value="Preventivo">Preventivo</MenuItem>
              <MenuItem value="Correctivo">Correctivo</MenuItem>
              <MenuItem value="Revisión general">Revisión general</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Fecha del Mantenimiento"
            type="date"
            name="fechaMantenimiento"
            fullWidth
            value={formData.fechaMantenimiento}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Kilometraje Actual"
            name="kilometrajeMantenimiento"
            fullWidth
            value={formData.kilometrajeMantenimiento}
            onChange={handleChange}
            margin="normal"
            type="number"
            inputProps={{ min: 0 }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="En Proceso">En Proceso</MenuItem>
              <MenuItem value="Completado">Completado</MenuItem>
              <MenuItem value="Cancelado">Cancelado</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Costo Total (USD)"
            name="costoTotal"
            fullWidth
            value={formData.costoTotal}
            onChange={handleChange}
            margin="normal"
            inputProps={{ step: "0.01", min: 0 }}
          />

          <TextField
            label="Repuestos Utilizados"
            name="repuestosUsados"
            fullWidth
            multiline
            rows={3}
            value={formData.repuestosUsados}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            label="Descripción"
            name="descripcion"
            fullWidth
            multiline
            rows={4}
            value={formData.descripcion}
            onChange={handleChange}
            margin="normal"
          />

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 2 }}
              disabled={isSubmitting || loadingVehiculos}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Actualizar Mantenimiento'
              )}
            </Button>
          </Box>
        </form>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default EditMaintenancePage;
