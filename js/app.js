const express = require('express');
const http = require('http');
const app = express();

app.use(express.static('public'));

const server = http.createServer(app);

module.exports = { app, server };
