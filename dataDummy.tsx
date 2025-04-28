import { Sequelize } from "sequelize-typescript";
import { User } from "./models/User";
const config = require("./config/config.json");
import { v4 } from "uuid";

const sequelize = new Sequelize({
    ...config.development,
    models: [User],
  });

  const users = [
    {
        user_id: v4(),
        name: "Calvin",
        username: "calvin123",
        password: "password123",
        email: "calvin@gmail.com",
        profilePicture: "",
        bio: "Hello, I'm Calvin",
        createdAt: new Date(),
    },
    {
        user_id: v4(),
        name: "Boston",
        username: "boston123",
        password: "password123",
        email: "boston@gmail.com",
        profilePicture: "",
        bio: "Hello, I'm Boston",
        createdAt: new Date(),
    },
    {
        user_id: v4(),
        name: "Jochal",
        username: "joch123",
        password: "password123",
        email: "jochal@gmail.com",
        profilePicture: "",
        bio: "Hello, I'm Jochal",
        createdAt: new Date(),
    },
    {
        user_id: v4(),
        name: "Felix",
        username: "felix123",
        password: "password123",
        email: "felix@gmail.com",
        profilePicture: "",
        bio: "Hello, I'm Felix",
        createdAt: new Date(),
    },
    {
        user_id: v4(),
        name: "Jopaul",
        username: "jopaul123",
        password: "password123",
        email: "paul@gmail.com",
        profilePicture: "",
        bio: "Hello, I'm Jopaul",
        createdAt: new Date(),
    },
  ]


  async function start() {
    await sequelize.sync({ force: true }); 
    await User.bulkCreate(users); 

    const { count, rows } = await User.findAndCountAll();
    console.log("Total Tasks:", count);
    console.log("Data Tasks:", JSON.stringify(rows, null, 2));

}

start();

