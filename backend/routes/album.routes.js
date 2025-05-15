const express = require('express');
const router = express.Router();
const albumController = require('../controller/album.controller');

router.post('/', albumController.createAlbum);
router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);
router.delete('/:id', albumController.deleteAlbum);
router.post('/add-photo', albumController.addPhotoToAlbum);
router.patch('/:albumId/remove-photo', albumController.removePhotoFromAlbum);

module.exports = router;