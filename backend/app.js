const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const photoRoutes = require('./routes/photo.routes');
const albumRoutes = require('./routes/album.routes');
const userRoutes = require('./routes/user.routes');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
  }).catch((err) => {
    console.error('Erro na conexão com MongoDB:', err);
  });

// Middlewares
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
