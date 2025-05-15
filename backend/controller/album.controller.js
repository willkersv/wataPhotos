const Album = require('../model/Album');
const Photo = require('../model/Photo');
const fs = require('fs');
const path = require('path');

const logError = (error) => {
  const logPath = path.join(__dirname, '../logs/errors.log');
  const logMessage = `${new Date().toISOString()} - ${error.message}\n`;
  fs.appendFileSync(logPath, logMessage);
};

exports.createAlbum = async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    if (!title || !userId) return res.status(400).json({ message: 'Título e ID do usuário são obrigatórios.' });

    const album = new Album({ title, description, user: userId });
    await album.save();

    res.status(201).json({ message: 'Álbum criado com sucesso.', album });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao criar álbum.' });
  }
};

exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate('user', 'name email').populate('photos');
    res.json(albums);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar álbuns.' });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('user', 'name email').populate('photos');
    if (!album) return res.status(404).json({ message: 'Álbum não encontrado.' });
    res.json(album);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar álbum.' });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Álbum não encontrado.' });
    res.json({ message: 'Álbum deletado com sucesso.' });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao deletar álbum.' });
  }
};

exports.addPhotoToAlbum = async (req, res) => {
  try {
    const { albumId, photoId } = req.body;
    const album = await Album.findById(albumId);
    const photo = await Photo.findById(photoId);

    if (!album || !photo) return res.status(404).json({ message: 'Álbum ou foto não encontrados.' });

    album.photos.push(photo._id);
    await album.save();

    res.json({ message: 'Foto adicionada ao álbum com sucesso.', album });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao adicionar foto ao álbum.' });
  }

  exports.removePhotoFromAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { photoId } = req.body;

    if (!photoId) {
      return res.status(400).json({ message: 'ID da foto é obrigatório.' });
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado.' });
    }

    // Remove a photoId do array de photos, se existir
    album.photos = album.photos.filter(id => id.toString() !== photoId);
    await album.save();

    res.json({ message: 'Foto removida do álbum com sucesso.', album });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover foto do álbum.' });
  }
};
};

exports.removePhotoFromAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { photoId } = req.body;

    if (!photoId) {
      return res.status(400).json({ message: 'photoId é obrigatório.' });
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado.' });
    }

    album.photos = album.photos.filter(
      (id) => id.toString() !== photoId
    );

    await album.save();

    res.json({ message: 'Foto removida do álbum com sucesso.', album });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover foto do álbum.' });
  }
};
