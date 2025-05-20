// config/dbConfig.js
const oracledb = require('oracledb');

const dbConfig = {
  user: 'FLOTIA',
  password: '123456',
  connectString: 'localhost:1521/orcl'
};

module.exports = dbConfig;

