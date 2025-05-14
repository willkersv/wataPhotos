const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const photoController = require('../controller/photo.controller');

router.post('/', upload.single('file'), photoController.uploadPhoto);
router.get('/', photoController.getAllPhotos);
router.get('/:id', photoController.getPhotoById);
router.delete('/:id', photoController.deletePhoto);

module.exports = router;
