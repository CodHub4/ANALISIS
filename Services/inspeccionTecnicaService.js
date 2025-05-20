const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

// Obtener todas las inspecciones técnicas
async function getInspeccionesTecnicas() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT INS_INSPECCION_ID, INS_VEH_VEHICULO_ID, INS_FECHA_INSPECCION, INS_TIPO_INSPECCION, INS_ESTADO FROM FLO_INSPECCION_TECNICA'
    );
    return result.rows.map(row => ({
      INS_INSPECCION_ID: row[0],
      INS_VEH_VEHICULO_ID: row[1],
      INS_FECHA_INSPECCION: row[2],
      INS_TIPO_INSPECCION: row[3],
      INS_ESTADO: row[4]
    }));
  } catch (err) {
    console.error("Error al obtener las inspecciones técnicas: ", err.message);
    throw new Error('Error al obtener las inspecciones técnicas: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Obtener una inspección técnica por ID
async function getInspeccionTecnicaById(id) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT INS_INSPECCION_ID, INS_VEH_VEHICULO_ID, INS_FECHA_INSPECCION, INS_TIPO_INSPECCION, INS_ESTADO FROM FLO_INSPECCION_TECNICA WHERE INS_INSPECCION_ID = :id',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Inspección técnica no encontrada');
    }

    const row = result.rows[0];
    return {
      INS_INSPECCION_ID: row[0],
      INS_VEH_VEHICULO_ID: row[1],
      INS_FECHA_INSPECCION: row[2],
      INS_TIPO_INSPECCION: row[3],
      INS_ESTADO: row[4]
    };
  } catch (err) {
    throw new Error('Error al obtener la inspección técnica: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Crear una nueva inspección técnica
async function createInspeccionTecnica(vehiculoId, fechaInspeccion, tipoInspeccion, estado = 'Pendiente') {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO FLO_INSPECCION_TECNICA (INS_VEH_VEHICULO_ID, INS_FECHA_INSPECCION, INS_TIPO_INSPECCION, INS_ESTADO)
      VALUES (:vehiculoId, :fechaInspeccion, :tipoInspeccion, :estado)`,
      [vehiculoId, fechaInspeccion, tipoInspeccion, estado],
      { autoCommit: true }
    );
    return { message: 'Inspección técnica agregada correctamente' };
  } catch (err) {
    throw new Error('Error al agregar la inspección técnica: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Actualizar una inspección técnica
async function updateInspeccionTecnica(id, vehiculoId, fechaInspeccion, tipoInspeccion, estado) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE FLO_INSPECCION_TECNICA SET INS_VEH_VEHICULO_ID = :vehiculoId, INS_FECHA_INSPECCION = :fechaInspeccion, 
      INS_TIPO_INSPECCION = :tipoInspeccion, INS_ESTADO = :estado WHERE INS_INSPECCION_ID = :id`,
      [vehiculoId, fechaInspeccion, tipoInspeccion, estado, id],
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      throw new Error('Inspección técnica no encontrada');
    }
    return { message: 'Inspección técnica actualizada correctamente' };
  } catch (err) {
    throw new Error('Error al actualizar la inspección técnica: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Eliminar una inspección técnica
async function deleteInspeccionTecnica(id) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `DELETE FROM FLO_INSPECCION_TECNICA WHERE INS_INSPECCION_ID = :id`,
      [id],
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      throw new Error('Inspección técnica no encontrada');
    }
    return { message: 'Inspección técnica eliminada correctamente' };
  } catch (err) {
    throw new Error('Error al eliminar la inspección técnica: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getInspeccionesTecnicas,
  getInspeccionTecnicaById,
  createInspeccionTecnica,
  updateInspeccionTecnica,
  deleteInspeccionTecnica
};

