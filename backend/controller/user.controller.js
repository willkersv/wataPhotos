const User = require('../model/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const logError = (error) => {
  const logPath = path.join(__dirname, '../logs/errors.log');
  const logMessage = `${new Date().toISOString()} - ${error.message}\n`;
  fs.appendFileSync(logPath, logMessage);
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ 
      _id: user._id, 
      name: user.name, 
      email: user.email,
      createdAt: user.createdAt 
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    logError(error);
    res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
      }
  
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  
      res.json({
        message: 'Login realizado com sucesso.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      logError(error);
      res.status(500).json({ message: 'Erro ao realizar login.' });
    }
  };
