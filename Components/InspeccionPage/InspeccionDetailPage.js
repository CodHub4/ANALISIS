import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Typography, Card, CardContent } from '@mui/material';
import './InspeccionDetailPage.css'; // Asegúrate de crear este archivo CSS

function InspeccionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspeccion, setInspeccion] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3001/inspecciones-tecnicas/${id}`)
      .then(response => {
        setInspeccion(response.data);
      })
      .catch(error => {
        console.error('Error al obtener la inspección:', error);
        alert('No se pudo cargar la información de la inspección');
      });
  }, [id]);

  if (!inspeccion) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="inspeccion-detail-container">
      <Typography variant="h1" className="page-title">
        Detalles de Inspección Técnica
      </Typography>

      <Card className="inspeccion-detail-card">
        <CardContent>
          <Typography variant="h5" component="h2" className="detail-title">
            ID de Inspección: {id}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Vehículo ID:</strong> {inspeccion.INS_VEH_VEHICULO_ID}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Fecha:</strong> {new Date(inspeccion.INS_FECHA_INSPECCION).toLocaleDateString()}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Tipo:</strong> {inspeccion.INS_TIPO_INSPECCION}
          </Typography>
          
          <Typography variant="body1" className="detail-item">
            <strong>Estado:</strong> 
            <span className={`status-${inspeccion.INS_ESTADO.toLowerCase()}`}>
              {inspeccion.INS_ESTADO}
            </span>
          </Typography>
        </CardContent>
      </Card>

      <div className="action-buttons">
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => navigate(`/editar-inspeccion/${id}`)}
          className="edit-button"
        >
          Editar Inspección
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/inspecciones-tecnicas')}
          className="back-button"
        >
          Volver al listado
        </Button>
      </div>
    </div>
  );
}

export default InspeccionDetailPage;
