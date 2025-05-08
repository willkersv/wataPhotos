const Album = require('../model/Album');
const fs = require('fs');
const path = require('path');

const logError = (error) => {
  const logPath = path.join(__dirname, '../logs/errors.log');
  const logMessage = `${new Date().toISOString()} - ${error.message}\n`;
  fs.appendFileSync(logPath, logMessage);
};

exports.createAlbum = async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ message: 'Nome e userId são obrigatórios.' });

    const album = new Album({ name, userId });
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao criar álbum.' });
  }
};

exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate('userId', 'name email');
    res.json(albums);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar álbuns.' });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Álbum não encontrado.' });
    res.json({ message: 'Álbum removido com sucesso.' });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao deletar álbum.' });
  }
};
