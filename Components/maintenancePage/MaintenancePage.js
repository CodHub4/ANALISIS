import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button, Typography, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import './MaintenancePage.css';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function MaintenancePage() {
  const [maintenances, setMaintenances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  useEffect(() => {
    axios.get('http://localhost:3001/mantenimientos')
      .then(response => {
        setMaintenances(response.data);
        showInitialStats(response.data);
      })
      .catch(error => {
        console.error('Error al obtener los mantenimientos!', error);
        setAlertMessage('Error al cargar los mantenimientos');
        setAlertSeverity('error');
        setOpenAlert(true);
      });
  }, []);

  const showInitialStats = (data) => {
    const total = data.length;
    const completados = data.filter(m => m.MAN_ESTADO === 'Completado').length;
    const pendientes = data.filter(m => m.MAN_ESTADO === 'Pendiente').length;
    const cancelados = data.filter(m => m.MAN_ESTADO === 'Cancelado').length;
    
    setAlertMessage(
      `Se cargaron ${total} mantenimientos: ${completados} completados, ${pendientes} pendientes, ${cancelados} cancelados`
    );
    setAlertSeverity('info');
    setOpenAlert(true);
  };

  const showStatsDialog = () => {
    setOpenStatsDialog(true);
  };

  const filteredMaintenances = maintenances.filter(maintenance =>
    maintenance.MAN_TIPO_MANTENIMIENTO.toLowerCase().includes(searchQuery.toLowerCase()) ||
    maintenance.MAN_ESTADO.toLowerCase().includes(searchQuery.toLowerCase()) ||
    maintenance.MAN_VEH_VEHICULO_ID.toString().includes(searchQuery)
  );

  // Estadísticas por estado
  const estadoData = filteredMaintenances.reduce((acc, maintenance) => {
    if (maintenance.MAN_ESTADO === 'Completado') acc.completado++;
    if (maintenance.MAN_ESTADO === 'Pendiente') acc.pendiente++;
    if (maintenance.MAN_ESTADO === 'Cancelado') acc.cancelado++;
    return acc;
  }, { completado: 0, pendiente: 0, cancelado: 0 });

  // Estadísticas por tipo de mantenimiento
  const tipoData = filteredMaintenances.reduce((acc, maintenance) => {
    if (maintenance.MAN_TIPO_MANTENIMIENTO === 'Preventivo') acc.preventivo++;
    if (maintenance.MAN_TIPO_MANTENIMIENTO === 'Correctivo') acc.correctivo++;
    if (maintenance.MAN_TIPO_MANTENIMIENTO === 'Predictivo') acc.predictivo++;
    return acc;
  }, { preventivo: 0, correctivo: 0, predictivo: 0 });

  // Datos para gráficos
  const estadoChartData = {
    labels: ['Completado', 'Pendiente', 'Cancelado'],
    datasets: [{
      label: 'Estado de Mantenimientos',
      data: [estadoData.completado, estadoData.pendiente, estadoData.cancelado],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      hoverOffset: 4
    }]
  };

  const tipoChartData = {
    labels: ['Preventivo', 'Correctivo', 'Predictivo'],
    datasets: [{
      label: 'Tipo de Mantenimiento',
      data: [tipoData.preventivo, tipoData.correctivo, tipoData.predictivo],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      hoverOffset: 4
    }]
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoUrl = `${window.location.origin}/imagenes/logo.png`;
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.text('Reporte de Mantenimientos', 50, 20);

      if (searchQuery) {
        doc.setFontSize(11);
        doc.text(`Filtro aplicado: "${searchQuery}"`, 50, 28);
      }

      doc.setFontSize(12);
      doc.text('Resumen Estadístico:', 14, 45);
      doc.text(`- Total mantenimientos: ${filteredMaintenances.length}`, 20, 55);
      doc.text(`- Completados: ${estadoData.completado} (${(estadoData.completado/filteredMaintenances.length*100).toFixed(1)}%)`, 20, 65);
      doc.text(`- Pendientes: ${estadoData.pendiente} (${(estadoData.pendiente/filteredMaintenances.length*100).toFixed(1)}%)`, 20, 75);
      doc.text(`- Cancelados: ${estadoData.cancelado} (${(estadoData.cancelado/filteredMaintenances.length*100).toFixed(1)}%)`, 20, 85);

      const tableColumn = ['ID', 'Vehículo ID', 'Fecha', 'Tipo', 'Estado', 'Costo'];
      const tableRows = filteredMaintenances.map(maintenance => [
        maintenance.MAN_MANTENIMIENTO_ID,
        maintenance.MAN_VEH_VEHICULO_ID,
        new Date(maintenance.MAN_FECHA_MANTENIMIENTO).toLocaleDateString(),
        maintenance.MAN_TIPO_MANTENIMIENTO,
        maintenance.MAN_ESTADO,
        maintenance.MAN_COSTO_TOTAL ? `Q${parseFloat(maintenance.MAN_COSTO_TOTAL).toFixed(2)}` : 'N/A'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(10);
          doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, data.settings.margin.left, pageHeight - 10);
          doc.text(`Generado el {new Date().toLocaleString()}`, doc.internal.pageSize.width - 60, pageHeight - 10);
        }
      });

      doc.save('reporte_mantenimientos.pdf');
      setAlertMessage('Reporte PDF generado exitosamente');
      setAlertSeverity('success');
      setOpenAlert(true);
    };

    img.onerror = () => {
      setAlertMessage('No se pudo cargar el logo para el PDF');
      setAlertSeverity('warning');
      setOpenAlert(true);
    };
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMaintenances.map(maintenance => ({
      'ID': maintenance.MAN_MANTENIMIENTO_ID,
      'Vehículo ID': maintenance.MAN_VEH_VEHICULO_ID,
      'Fecha Mantenimiento': new Date(maintenance.MAN_FECHA_MANTENIMIENTO).toLocaleDateString(),
      'Tipo': maintenance.MAN_TIPO_MANTENIMIENTO,
      'Estado': maintenance.MAN_ESTADO,
      'Costo': maintenance.MAN_COSTO_TOTAL ? parseFloat(maintenance.MAN_COSTO_TOTAL) : 'N/A'
    })));

    const statsWorksheet = XLSX.utils.json_to_sheet([
      { 'Métrica': 'Total mantenimientos', 'Valor': filteredMaintenances.length },
      { 'Métrica': 'Completados', 'Valor': estadoData.completado, 'Porcentaje': `${(estadoData.completado/filteredMaintenances.length*100).toFixed(1)}%` },
      { 'Métrica': 'Pendientes', 'Valor': estadoData.pendiente, 'Porcentaje': `${(estadoData.pendiente/filteredMaintenances.length*100).toFixed(1)}%` },
      { 'Métrica': 'Cancelados', 'Valor': estadoData.cancelado, 'Porcentaje': `${(estadoData.cancelado/filteredMaintenances.length*100).toFixed(1)}%` }
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mantenimientos');
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadísticas');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reporte_mantenimientos.xlsx');
    
    setAlertMessage('Reporte Excel generado exitosamente');
    setAlertSeverity('success');
    setOpenAlert(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este mantenimiento?')) {
      axios.delete(`http://localhost:3001/mantenimientos/${id}`)
        .then(response => {
          const updatedMaintenances = maintenances.filter(maintenance => maintenance.MAN_MANTENIMIENTO_ID !== id);
          setMaintenances(updatedMaintenances);
          
          setAlertMessage('Mantenimiento eliminado correctamente');
          setAlertSeverity('success');
          setOpenAlert(true);
        })
        .catch(error => {
          console.error('Error al eliminar el mantenimiento:', error);
          setAlertMessage('Hubo un error al eliminar el mantenimiento');
          setAlertSeverity('error');
          setOpenAlert(true);
        });
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleCloseStatsDialog = () => {
    setOpenStatsDialog(false);
  };

  return (
    <div className="users-container">
      <div className="navbar">
        <div className="logo"><h2>Aplicación</h2></div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Inicio</Link>
         
          <Link to="/mantenimientos" className="nav-link">Mantenimientos</Link>
          <Link to="/nuevo-mantenimiento" className="nav-link">Nuevo Mantenimiento</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar mantenimiento..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog}>
        <DialogTitle>Estadísticas Detalladas</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Resumen General</Typography>
          <Typography>
            Total de mantenimientos: <strong>{filteredMaintenances.length}</strong>
          </Typography>
          
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Por Estado</Typography>
          <Typography>
            Completados: <strong>{estadoData.completado}</strong> ({filteredMaintenances.length > 0 ? (estadoData.completado/filteredMaintenances.length*100).toFixed(1) : 0}%)
          </Typography>
          <Typography>
            Pendientes: <strong>{estadoData.pendiente}</strong> ({filteredMaintenances.length > 0 ? (estadoData.pendiente/filteredMaintenances.length*100).toFixed(1) : 0}%)
          </Typography>
          <Typography>
            Cancelados: <strong>{estadoData.cancelado}</strong> ({filteredMaintenances.length > 0 ? (estadoData.cancelado/filteredMaintenances.length*100).toFixed(1) : 0}%)
          </Typography>
          
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Por Tipo</Typography>
          <Typography>
            Preventivos: <strong>{tipoData.preventivo}</strong>
          </Typography>
          <Typography>
            Correctivos: <strong>{tipoData.correctivo}</strong>
          </Typography>
          <Typography>
            Predictivos: <strong>{tipoData.predictivo}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatsDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h1" className="page-title" gutterBottom>
        Lista de Mantenimientos
      </Typography>

      <div className="report-buttons" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Button variant="contained" color="primary" onClick={generatePDF}>
          Generar PDF
        </Button>
        <Button variant="contained" color="success" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
        <Button variant="contained" color="info" onClick={showStatsDialog}>
          Ver Estadísticas
        </Button>
      </div>

      <div className="table-container">
        {filteredMaintenances.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo ID</th>
                <th>Fecha Mantenimiento</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Costo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenances.map(maintenance => (
                <tr key={maintenance.MAN_MANTENIMIENTO_ID}>
                  <td>{maintenance.MAN_MANTENIMIENTO_ID}</td>
                  <td>{maintenance.MAN_VEH_VEHICULO_ID}</td>
                  <td>{new Date(maintenance.MAN_FECHA_MANTENIMIENTO).toLocaleDateString()}</td>
                  <td>{maintenance.MAN_TIPO_MANTENIMIENTO}</td>
                  <td>
                    <span className={`status-badge ${maintenance.MAN_ESTADO.toLowerCase()}`}>
                      {maintenance.MAN_ESTADO}
                    </span>
                  </td>
                  <td>{maintenance.MAN_COSTO_TOTAL ? `Q${parseFloat(maintenance.MAN_COSTO_TOTAL).toFixed(2)}` : 'N/A'}</td>
                  <td className="actions">
                    <Link to={`/mantenimientos/${maintenance.MAN_MANTENIMIENTO_ID}`}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        style={{ 
                          backgroundColor: '#1976d2', 
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          marginRight: '8px'
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </Link>
                    <Link to={`/editar-mantenimiento/${maintenance.MAN_MANTENIMIENTO_ID}`}>
                      <Button 
                        variant="contained" 
                        color="secondary"
                        style={{ 
                          backgroundColor: '#9c27b0', 
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          marginRight: '8px'
                        }}
                      >
                        Editar
                      </Button>
                    </Link>
                    <Button 
                      variant="contained" 
                      color="error"
                      style={{ 
                        backgroundColor: '#d32f2f', 
                        color: 'white',
                        padding: '8px 16px',
                        fontSize: '0.875rem',
                        textTransform: 'none'
                      }}
                      onClick={() => handleDelete(maintenance.MAN_MANTENIMIENTO_ID)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay mantenimientos disponibles o no se encuentra lo que buscas.</p>
        )}
      </div>

      <div className="chart-container" style={{
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '30px'
      }}>
        <div style={{ maxWidth: '300px' }}>
          <Typography variant="h6" align="center">Mantenimientos por Estado</Typography>
          <Pie data={estadoChartData} />
        </div>
        <div style={{ maxWidth: '300px' }}>
          <Typography variant="h6" align="center">Mantenimientos por Tipo</Typography>
          <Pie data={tipoChartData} />
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;
