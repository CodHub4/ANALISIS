import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importar las páginas correspondientes
import WelcomePage from './components/WelcomePage/WelcomePage';


//JESUS
import UsersPage from './components/UsersPage/UsersPage';
import CreateUserPage from './components/UsersPage/CreateUserPage';
import EditUserPage from './components/UsersPage/EditUserPage';
import UserDetailPage from './components/UsersPage/UserDetailPage';



//FERNANDO
import ConductorsPage from './components/conductorsPage/ConductorsPage';
import CreateConductorPage from './components/conductorsPage/CreateConductorPage';
import EditConductorPage from './components/conductorsPage/EditConductorPage';
import ConductorDetailPage from './components/conductorsPage/ConductorDetailPage';



//DANIEL
import MaintenancePage from './components/maintenancePage/MaintenancePage';
import CreateMaintenancePage from './components/maintenancePage/CreateMaintenancePage';
import EditMaintenancePage from './components/maintenancePage/EditMaintenancePage';
import MaintenanceDetailPage from './components/maintenancePage/MaintenanceDetailPage';

import InspeccionPage from './components/InspeccionPage/InspeccionPage';
import CreateInspeccionPage from './components/InspeccionPage/CreateInspeccionPage';
import EditInspeccionPage from './components/InspeccionPage/EditInspeccionPage';
import InspeccionDetailPage from './components/InspeccionPage/InspeccionDetailPage';


//ERNESTO





function App() {
  return (
    <Router>
      <div className="App">
		
        <Routes>

          {/* Ruta para la página de bienvenida (página principal) */}
          <Route path="/" element={<WelcomePage />} />

          {/* Rutas para la lista de usuarios JESUS*/}
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/nuevo-usuario" element={<CreateUserPage />} />
          <Route path="/editar-usuario/:id" element={<EditUserPage />} />
          <Route path="/usuario/:id" element={<UserDetailPage />} />



          {/* Rutas para la lista de conductores FERNANDO*/}
          <Route path="/conductores" element={<ConductorsPage />} />
          <Route path="/conductores/crear" element={<CreateConductorPage />} />
          <Route path="/editar-conductor/:id" element={<EditConductorPage />} />
          <Route path="/conductores/:id" element={<ConductorDetailPage />} />



          {/* Rutas para la lista de mantenimientos DANIEL*/}
          <Route path="/mantenimientos" element={<MaintenancePage />} />
	        <Route path="/nuevo-mantenimiento" element={<CreateMaintenancePage />} />
	        <Route path="/editar-mantenimiento/:id" element={<EditMaintenancePage />} />
	        <Route path="/mantenimientos/:id" element={<MaintenanceDetailPage />} />

	       {/* Rutas para el módulo de inspecciones DANIEL*/}
	        <Route path="/inspecciones-tecnicas" element={<InspeccionPage />} />
          <Route path="/nueva-inspeccion" element={<CreateInspeccionPage />} />
          <Route path="/editar-inspeccion/:id" element={<EditInspeccionPage />} />
          <Route path="/inspeccion/:id" element={<InspeccionDetailPage />} />



		  {/* Rutas para el módulo de asignaciones ERNESTO*/}

  
		  {/* Rutas para el módulo de historialViaje ERNESTO*/}

	 
   

        </Routes>
      </div>
    </Router>
  );
}

export default App;

//hola