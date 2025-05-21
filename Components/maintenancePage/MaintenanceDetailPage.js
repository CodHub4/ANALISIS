import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Typography, Card, CardContent } from '@mui/material';
import './MaintenancePage.css'; // Usaremos el mismo CSS que MaintenancePage

function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/mantenimientos/${id}`);
        setMaintenance(response.data);
      } catch (err) {
        setError('Error al cargar los detalles del mantenimiento');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este mantenimiento?')) {
      try {
        await axios.delete(`http://localhost:3001/mantenimientos/${id}`);
        navigate('/mantenimientos');
      } catch (err) {
        console.error('Error al eliminar:', err);
        setError('No se pudo eliminar el mantenimiento');
      }
    }
  };

  if (loading) {
    return <div className="loading-message">Cargando detalles del mantenimiento...</div>;
  }

  if (!maintenance) {
    return <div className="error-message">Mantenimiento no encontrado</div>;
  }

  return (
    <div className="users-container">
      <Typography variant="h1" className="page-title">
        Detalles de Mantenimiento
      </Typography>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Card className="detail-card">
        <CardContent>
          <Typography variant="h5" component="h2" className="detail-title">
            ID de Mantenimiento: {id}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Vehículo ID:</strong> {maintenance.MAN_VEH_VEHICULO_ID}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Fecha:</strong> {new Date(maintenance.MAN_FECHA_MANTENIMIENTO).toLocaleDateString()}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Tipo:</strong> {maintenance.MAN_TIPO_MANTENIMIENTO}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Kilometraje:</strong> {maintenance.MAN_KILOMETRAJE_MANTENIMIENTO} km
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Estado:</strong> 
            <span className={`status-badge ${maintenance.MAN_ESTADO.toLowerCase()}`}>
              {maintenance.MAN_ESTADO}
            </span>
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Costo Total:</strong> Q{maintenance.MAN_COSTO_TOTAL?.toFixed(2)}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Repuestos Utilizados:</strong> {maintenance.MAN_REPUESTOS_USADOS || 'N/A'}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Descripción:</strong>
            <div className="description-text">
              {maintenance.MAN_DESCRIPCION}
            </div>
          </Typography>
        </CardContent>
      </Card>

      <div className="action-buttons">
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => navigate(`/editar-mantenimiento/${id}`)}
          className="edit-button"
          style={{ marginRight: '16px' }}
        >
          Editar Mantenimiento
        </Button>
        
       

        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/mantenimientos')}
          className="back-button"
        >
          Volver al listado
        </Button>
      </div>
    </div>
  );
}

export default MaintenanceDetailPage;
