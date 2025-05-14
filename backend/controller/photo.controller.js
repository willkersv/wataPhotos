const Photo = require('../model/Photo');
const fs = require('fs');
const path = require('path');

const logError = (error) => {
  const logPath = path.join(__dirname, '../logs/errors.log');
  const logMessage = `${new Date().toISOString()} - ${error.message}\n`;
  fs.appendFileSync(logPath, logMessage);
};

exports.uploadPhoto = async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });

    const photo = new Photo({
      title,
      description,
      filename: req.file.filename,
      user: userId
    });

    await photo.save();

    res.status(201).json({
      message: 'Foto enviada com sucesso.',
      photo
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao salvar foto.' });
  }
};

exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find().populate('user', 'name email');
    res.json(photos);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar fotos.' });
  }
};

exports.getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('user', 'name email');
    if (!photo) return res.status(404).json({ message: 'Foto não encontrada.' });
    res.json(photo);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar foto.' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Foto não encontrada.' });

    // Remove o arquivo do disco
    const filePath = path.join(__dirname, '../uploads/', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: 'Foto deletada com sucesso.' });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao deletar foto.' });
  }
};
