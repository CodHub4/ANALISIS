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
import './InspeccionPage.css';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function InspeccionPage() {
  const [inspecciones, setInspecciones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  useEffect(() => {
    axios.get('http://localhost:3001/inspecciones-tecnicas')
      .then(response => {
        setInspecciones(response.data);
        // Mostrar alerta con estadísticas iniciales
        showInitialStats(response.data);
      })
      .catch(error => {
        console.error('Hubo un error al obtener las inspecciones!', error);
        setAlertMessage('Error al cargar las inspecciones');
        setAlertSeverity('error');
        setOpenAlert(true);
      });
  }, []);

  const showInitialStats = (data) => {
    const total = data.length;
    const aprobadas = data.filter(i => i.INS_ESTADO === 'Aprobado').length;
    const rechazadas = data.filter(i => i.INS_ESTADO === 'Rechazado').length;
    const pendientes = data.filter(i => i.INS_ESTADO === 'Pendiente').length;
    
    setAlertMessage(
      `Se cargaron ${total} inspecciones: ${aprobadas} aprobadas, ${rechazadas} rechazadas, ${pendientes} pendientes`
    );
    setAlertSeverity('info');
    setOpenAlert(true);
  };

  const showStatsDialog = () => {
    setOpenStatsDialog(true);
  };

  const filteredInspecciones = inspecciones.filter(inspeccion =>
    inspeccion.INS_TIPO_INSPECCION.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inspeccion.INS_ESTADO.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inspeccion.INS_VEH_VEHICULO_ID.toString().includes(searchQuery)
  );

  // Estadísticas por estado
  const estadoData = filteredInspecciones.reduce((acc, inspeccion) => {
    if (inspeccion.INS_ESTADO === 'Aprobado') acc.aprobado++;
    if (inspeccion.INS_ESTADO === 'Rechazado') acc.rechazado++;
    if (inspeccion.INS_ESTADO === 'Pendiente') acc.pendiente++;
    return acc;
  }, { aprobado: 0, rechazado: 0, pendiente: 0 });

  // Estadísticas por tipo de inspección
  const tipoData = filteredInspecciones.reduce((acc, inspeccion) => {
    if (inspeccion.INS_TIPO_INSPECCION === 'Rutinaria') acc.rutinaria++;
    if (inspeccion.INS_TIPO_INSPECCION === 'Extraordinaria') acc.extraordinaria++;
    if (inspeccion.INS_TIPO_INSPECCION === 'Especial') acc.especial++;
    return acc;
  }, { rutinaria: 0, extraordinaria: 0, especial: 0 });

  // Datos para gráficos
  const estadoChartData = {
    labels: ['Aprobado', 'Rechazado', 'Pendiente'],
    datasets: [{
      label: 'Estado de Inspecciones',
      data: [estadoData.aprobado, estadoData.rechazado, estadoData.pendiente],
      backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
      hoverOffset: 4
    }]
  };

  const tipoChartData = {
    labels: ['Rutinaria', 'Extraordinaria', 'Especial'],
    datasets: [{
      label: 'Tipo de Inspección',
      data: [tipoData.rutinaria, tipoData.extraordinaria, tipoData.especial],
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
      doc.text('Reporte de Inspecciones Técnicas', 50, 20);

      if (searchQuery) {
        doc.setFontSize(11);
        doc.text(`Filtro aplicado: "${searchQuery}"`, 50, 28);
      }

      // Agregar resumen estadístico al PDF
      doc.setFontSize(12);
      doc.text('Resumen Estadístico:', 14, 45);
      doc.text(`- Total inspecciones: ${filteredInspecciones.length}`, 20, 55);
      doc.text(`- Aprobadas: ${estadoData.aprobado} (${(estadoData.aprobado/filteredInspecciones.length*100).toFixed(1)}%)`, 20, 65);
      doc.text(`- Rechazadas: ${estadoData.rechazado} (${(estadoData.rechazado/filteredInspecciones.length*100).toFixed(1)}%)`, 20, 75);
      doc.text(`- Pendientes: ${estadoData.pendiente} (${(estadoData.pendiente/filteredInspecciones.length*100).toFixed(1)}%)`, 20, 85);

      const tableColumn = ['ID', 'Vehículo ID', 'Fecha', 'Tipo', 'Estado'];
      const tableRows = filteredInspecciones.map(inspeccion => [
        inspeccion.INS_INSPECCION_ID,
        inspeccion.INS_VEH_VEHICULO_ID,
        new Date(inspeccion.INS_FECHA_INSPECCION).toLocaleDateString(),
        inspeccion.INS_TIPO_INSPECCION,
        inspeccion.INS_ESTADO
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(10);
          doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, data.settings.margin.left, pageHeight - 10);
          doc.text(`Generado el ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 60, pageHeight - 10);
        }
      });

      doc.save('reporte_inspecciones.pdf');
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
    const worksheet = XLSX.utils.json_to_sheet(filteredInspecciones.map(inspeccion => ({
      'ID': inspeccion.INS_INSPECCION_ID,
      'Vehículo ID': inspeccion.INS_VEH_VEHICULO_ID,
      'Fecha Inspección': new Date(inspeccion.INS_FECHA_INSPECCION).toLocaleDateString(),
      'Tipo': inspeccion.INS_TIPO_INSPECCION,
      'Estado': inspeccion.INS_ESTADO
    })));

    // Agregar hoja con estadísticas
    const statsWorksheet = XLSX.utils.json_to_sheet([
      { 'Métrica': 'Total inspecciones', 'Valor': filteredInspecciones.length },
      { 'Métrica': 'Aprobadas', 'Valor': estadoData.aprobado, 'Porcentaje': `${(estadoData.aprobado/filteredInspecciones.length*100).toFixed(1)}%` },
      { 'Métrica': 'Rechazadas', 'Valor': estadoData.rechazado, 'Porcentaje': `${(estadoData.rechazado/filteredInspecciones.length*100).toFixed(1)}%` },
      { 'Métrica': 'Pendientes', 'Valor': estadoData.pendiente, 'Porcentaje': `${(estadoData.pendiente/filteredInspecciones.length*100).toFixed(1)}%` }
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inspecciones');
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadísticas');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reporte_inspecciones.xlsx');
    
    setAlertMessage('Reporte Excel generado exitosamente');
    setAlertSeverity('success');
    setOpenAlert(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta inspección?')) {
      axios.delete(`http://localhost:3001/inspecciones-tecnicas/${id}`)
        .then(response => {
          const updatedInspecciones = inspecciones.filter(inspeccion => inspeccion.INS_INSPECCION_ID !== id);
          setInspecciones(updatedInspecciones);
          
          setAlertMessage('Inspección eliminada correctamente');
          setAlertSeverity('success');
          setOpenAlert(true);
        })
        .catch(error => {
          console.error('Error al eliminar la inspección:', error);
          setAlertMessage('Hubo un error al eliminar la inspección');
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
      {/* Barra de navegación */}
      <div className="navbar">
        <div className="logo"><h2>Aplicación</h2></div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/inspecciones" className="nav-link">Inspecciones</Link>
          <Link to="/nueva-inspeccion" className="nav-link">Nueva Inspección</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar inspección..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Snackbar para alertas */}
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

      {/* Diálogo de estadísticas detalladas */}
      <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog}>
        <DialogTitle>Estadísticas Detalladas</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Resumen General</Typography>
          <Typography>
            Total de inspecciones: <strong>{filteredInspecciones.length}</strong>
          </Typography>
          
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Por Estado</Typography>
          <Typography>
            Aprobadas: <strong>{estadoData.aprobado}</strong> ({filteredInspecciones.length > 0 ? (estadoData.aprobado/filteredInspecciones.length*100).toFixed(1) : 0}%)
          </Typography>
          <Typography>
            Rechazadas: <strong>{estadoData.rechazado}</strong> ({filteredInspecciones.length > 0 ? (estadoData.rechazado/filteredInspecciones.length*100).toFixed(1) : 0}%)
          </Typography>
          <Typography>
            Pendientes: <strong>{estadoData.pendiente}</strong> ({filteredInspecciones.length > 0 ? (estadoData.pendiente/filteredInspecciones.length*100).toFixed(1) : 0}%)
          </Typography>
          
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Por Tipo</Typography>
          <Typography>
            Rutinarias: <strong>{tipoData.rutinaria}</strong>
          </Typography>
          <Typography>
            Extraordinarias: <strong>{tipoData.extraordinaria}</strong>
          </Typography>
          <Typography>
            Especiales: <strong>{tipoData.especial}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatsDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h1" className="page-title" gutterBottom>
        Lista de Inspecciones Técnicas
      </Typography>

      {/* Botones de reporte y estadísticas */}
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

      {/* Tabla de inspecciones */}
      <div className="table-container">
        {filteredInspecciones.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo ID</th>
                <th>Fecha Inspección</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspecciones.map(inspeccion => (
                <tr key={inspeccion.INS_INSPECCION_ID}>
                  <td>{inspeccion.INS_INSPECCION_ID}</td>
                  <td>{inspeccion.INS_VEH_VEHICULO_ID}</td>
                  <td>{new Date(inspeccion.INS_FECHA_INSPECCION).toLocaleDateString()}</td>
                  <td>{inspeccion.INS_TIPO_INSPECCION}</td>
                  <td>
                    <span className={`status-badge ${inspeccion.INS_ESTADO.toLowerCase()}`}>
                      {inspeccion.INS_ESTADO}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/inspeccion/${inspeccion.INS_INSPECCION_ID}`}>
                      <Button variant="contained" color="primary">Ver Detalles</Button>
                    </Link>
                    <Link to={`/editar-inspeccion/${inspeccion.INS_INSPECCION_ID}`}>
                      <Button variant="contained" color="secondary">Editar</Button>
                    </Link>
                    <Button variant="contained" color="error" onClick={() => handleDelete(inspeccion.INS_INSPECCION_ID)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay inspecciones disponibles o no se encuentra lo que buscas.</p>
        )}
      </div>

      {/* Sección de gráficos */}
      <div className="chart-container" style={{
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '30px'
      }}>
        <div style={{ maxWidth: '300px' }}>
          <Typography variant="h6" align="center">Inspecciones por Estado</Typography>
          <Pie data={estadoChartData} />
        </div>
        <div style={{ maxWidth: '300px' }}>
          <Typography variant="h6" align="center">Inspecciones por Tipo</Typography>
          <Pie data={tipoChartData} />
        </div>
      </div>
    </div>
  );
}

export default InspeccionPage;
