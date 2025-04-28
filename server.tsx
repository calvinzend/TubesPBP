import express from 'express';
import cors from 'cors';
import { v4 } from 'uuid';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';
const config = require('./config/config.json');

const sequelize = new Sequelize({
  ...config.development,
  models: [User],
});

const app = express();
app.use(cors());
app.use(express.json()); 

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
