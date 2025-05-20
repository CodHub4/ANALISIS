import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando detalles del mantenimiento...</p>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Mantenimiento no encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/mantenimientos')}
          style={{ padding: '8px 12px', background: '#ddd', border: 'none', borderRadius: '4px' }}
        >
          ← Volver
        </button>
        <div>
          <button
            onClick={() => navigate(`/editar-mantenimiento/${id}`)}
            style={{ 
              padding: '8px 12px', 
              background: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            style={{ 
              padding: '8px 12px', 
              background: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            Eliminar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#ffebee', 
          color: '#f44336', 
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <h1 style={{ marginBottom: '20px' }}>Detalles del Mantenimiento #{maintenance.MAN_MANTENIMIENTO_ID}</h1>

      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Información Básica</h3>
            <div style={{ marginTop: '15px' }}>
              <p><strong>Vehículo ID:</strong> {maintenance.MAN_VEH_VEHICULO_ID}</p>
              <p><strong>Tipo de Mantenimiento:</strong> {maintenance.MAN_TIPO_MANTENIMIENTO}</p>
              <p><strong>Fecha:</strong> {formatDate(maintenance.MAN_FECHA_MANTENIMIENTO)}</p>
              <p><strong>Kilometraje:</strong> {maintenance.MAN_KILOMETRAJE_MANTENIMIENTO} km</p>
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Estado y Costos</h3>
            <div style={{ marginTop: '15px' }}>
              <p>
                <strong>Estado:</strong> 
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 
                    maintenance.MAN_ESTADO === 'Completado' ? '#e8f5e9' :
                    maintenance.MAN_ESTADO === 'Pendiente' ? '#fff8e1' :
                    maintenance.MAN_ESTADO === 'Cancelado' ? '#ffebee' : '#e3f2fd',
                  color: 
                    maintenance.MAN_ESTADO === 'Completado' ? '#2e7d32' :
                    maintenance.MAN_ESTADO === 'Pendiente' ? '#f57f17' :
                    maintenance.MAN_ESTADO === 'Cancelado' ? '#c62828' : '#1565c0'
                }}>
                  {maintenance.MAN_ESTADO}
                </span>
              </p>
              <p><strong>Costo Total:</strong> ${maintenance.MAN_COSTO_TOTAL?.toFixed(2)}</p>
              <p><strong>Repuestos Utilizados:</strong> {maintenance.MAN_REPUESTOS_USADOS || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Descripción</h3>
          <div style={{ 
            marginTop: '15px', 
            whiteSpace: 'pre-line',
            background: '#f9f9f9',
            padding: '15px',
            borderRadius: '4px'
          }}>
            {maintenance.MAN_DESCRIPCION}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDetailPage;
