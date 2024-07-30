import mysql from 'mysql2/promise';

const databaseConfig = {
  host: process.env.ENDPOINT,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASENAME,
};

export const getConnection = async () => {
  return mysql.createConnection(databaseConfig);
};
