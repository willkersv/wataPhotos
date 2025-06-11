const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const auth = require('../middlewares/auth');

router.post('/create', userController.createUser);
router.post('/login', userController.login);

router.get('/', auth, userController.getUsers);
router.get('/:id', auth, userController.getUserById);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;