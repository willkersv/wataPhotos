const express = require('express');
const mongoose = require('mongoose');
const photoRoutes = require('./routes/photo.routes');
const albumRoutes = require('./routes/album.routes');
const userRoutes = require('./routes/user.routes');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
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
