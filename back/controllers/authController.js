const userModel = require("../models/userModel");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { displayname, name, firstname, email, password } = req.body;
    const newUser = await userModel.create({
      displayname,
      name,
      firstname,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(user.dataValues.id);

    const token = jwt.sign({ id: user.dataValues.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_SECRET,
    });

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ message: "User logged in" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInformations = async (req, res) => {
  console.log(req.user.id);
  try {
    const user = await userModel.findByPk(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
