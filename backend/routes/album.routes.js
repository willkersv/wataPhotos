const express = require('express');
const router = express.Router();
const albumController = require('../controller/album.controller');

router.post('/', albumController.createAlbum);
router.get('/', albumController.getAllAlbums);
router.delete('/:id', albumController.deleteAlbum);

module.exports = router;
