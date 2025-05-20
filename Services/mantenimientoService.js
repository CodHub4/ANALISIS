// services/mantenimientoService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

// Obtener todos los mantenimientos
async function getMantenimientos() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT MAN_MANTENIMIENTO_ID, MAN_VEH_VEHICULO_ID, MAN_TIPO_MANTENIMIENTO, MAN_FECHA_MANTENIMIENTO, MAN_KILOMETRAJE_MANTENIMIENTO, MAN_DESCRIPCION, MAN_ESTADO, MAN_COSTO_TOTAL, MAN_REPUESTOS_USADOS FROM FLO_MANTENIMIENTO'
    );
    return result.rows.map(row => ({
      MAN_MANTENIMIENTO_ID: row[0],
      MAN_VEH_VEHICULO_ID: row[1],
      MAN_TIPO_MANTENIMIENTO: row[2],
      MAN_FECHA_MANTENIMIENTO: row[3],
      MAN_KILOMETRAJE_MANTENIMIENTO: row[4],
      MAN_DESCRIPCION: row[5],
      MAN_ESTADO: row[6],
      MAN_COSTO_TOTAL: row[7],
      MAN_REPUESTOS_USADOS: row[8]
    }));
  } catch (err) {
    console.error("Error al obtener los mantenimientos: ", err.message);
    throw new Error('Error al obtener los mantenimientos: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Obtener un mantenimiento por ID
async function getMantenimientoById(id) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT MAN_MANTENIMIENTO_ID, MAN_VEH_VEHICULO_ID, MAN_TIPO_MANTENIMIENTO, MAN_FECHA_MANTENIMIENTO, MAN_KILOMETRAJE_MANTENIMIENTO, MAN_DESCRIPCION, MAN_ESTADO, MAN_COSTO_TOTAL, MAN_REPUESTOS_USADOS FROM FLO_MANTENIMIENTO WHERE MAN_MANTENIMIENTO_ID = :id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Mantenimiento no encontrado');
    }

    const row = result.rows[0];
    return {
      MAN_MANTENIMIENTO_ID: row[0],
      MAN_VEH_VEHICULO_ID: row[1],
      MAN_TIPO_MANTENIMIENTO: row[2],
      MAN_FECHA_MANTENIMIENTO: row[3],
      MAN_KILOMETRAJE_MANTENIMIENTO: row[4],
      MAN_DESCRIPCION: row[5],
      MAN_ESTADO: row[6],
      MAN_COSTO_TOTAL: row[7],
      MAN_REPUESTOS_USADOS: row[8]
    };
  } catch (err) {
    throw new Error('Error al obtener el mantenimiento: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Crear un nuevo mantenimiento
async function createMantenimiento(vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO FLO_MANTENIMIENTO (MAN_VEH_VEHICULO_ID, MAN_TIPO_MANTENIMIENTO, MAN_FECHA_MANTENIMIENTO, MAN_KILOMETRAJE_MANTENIMIENTO, MAN_DESCRIPCION, MAN_ESTADO, MAN_COSTO_TOTAL, MAN_REPUESTOS_USADOS)
      VALUES (:vehiculoId, :tipoMantenimiento, :fechaMantenimiento, :kilometrajeMantenimiento, :descripcion, :estado, :costoTotal, :repuestosUsados)`,
      [vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados],
      { autoCommit: true }
    );
    return { message: 'Mantenimiento agregado correctamente' };
  } catch (err) {
    throw new Error('Error al agregar el mantenimiento: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Actualizar un mantenimiento
async function updateMantenimiento(id, vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE FLO_MANTENIMIENTO SET MAN_VEH_VEHICULO_ID = :vehiculoId, MAN_TIPO_MANTENIMIENTO = :tipoMantenimiento, 
      MAN_FECHA_MANTENIMIENTO = :fechaMantenimiento, MAN_KILOMETRAJE_MANTENIMIENTO = :kilometrajeMantenimiento, 
      MAN_DESCRIPCION = :descripcion, MAN_ESTADO = :estado, MAN_COSTO_TOTAL = :costoTotal, 
      MAN_REPUESTOS_USADOS = :repuestosUsados WHERE MAN_MANTENIMIENTO_ID = :id`,
      [vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados, id],
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      throw new Error('Mantenimiento no encontrado');
    }
    return { message: 'Mantenimiento actualizado correctamente' };
  } catch (err) {
    throw new Error('Error al actualizar el mantenimiento: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Eliminar un mantenimiento
async function deleteMantenimiento(id) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `DELETE FROM FLO_MANTENIMIENTO WHERE MAN_MANTENIMIENTO_ID = :id`,
      [id],
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      throw new Error('Mantenimiento no encontrado');
    }
    return { message: 'Mantenimiento eliminado correctamente' };
  } catch (err) {
    throw new Error('Error al eliminar el mantenimiento: ' + err.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getMantenimientos,
  getMantenimientoById,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento
};

