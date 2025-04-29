import { Sequelize } from "sequelize-typescript";
import { User } from "./models/User";
import { Tweet } from "./models/Tweet";
const config = require("./config/config.json");
import { v4 } from "uuid";

const sequelize = new Sequelize({
    ...config.development,
    models: [Tweet],
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


  const posts = [
    {
            
           tweet_id: v4(),
            user_id: "5395e4a9-37b3-4ba5-943d-b0ccd1f49bd8",
            content: "Hello, I'm Calvin",
            image_path: "",
            createdAt: new Date(),
        },
        {
           tweet_id: v4(),
            user_id: "5395e4a9-37b3-4ba5-943d-b0ccd1f49bd8",
            content: "Hello, I'm Boston",
            image_path: "",
            createdAt: new Date(),
        },
        {
           tweet_id: v4(),
            user_id: "5395e4a9-37b3-4ba5-943d-b0ccd1f49bd8",
            content: "Hello, I'm Jochal",
            image_path: "",
            createdAt: new Date(),
        },
        {
           tweet_id: v4(),
            user_id: "5395e4a9-37b3-4ba5-943d-b0ccd1f49bd8",
            content: "Hello, I'm Felix",
            image_path: "",
            createdAt: new Date(),
        },
        {
           tweet_id: v4(),
            user_id: "5395e4a9-37b3-4ba5-943d-b0ccd1f49bd8",
            content: "Hello, I'm Jopaul",
            image_path: "",
            createdAt: new Date(),
        },
]


//   async function start() {
//     await sequelize.sync({ force: true }); 
//     await User.bulkCreate(users); 

//     const { count, rows } = await User.findAndCountAll();
//     console.log("Total Tasks:", count);
//     console.log("Data Tasks:", JSON.stringify(rows, null, 2));

// }
  async function start() {
    await sequelize.sync({ force: true }); 
    await Tweet.bulkCreate(posts); 

    const { count, rows } = await Tweet.findAndCountAll();
    console.log("Total Tasks:", count);
    console.log("Data Tasks:", JSON.stringify(rows, null, 2));

}

start();

