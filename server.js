const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const DB = require('./config');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception...');
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`CSM API running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('App Shutting Down...');
  server.close(() => {
    process.exit(1);
  });
});
