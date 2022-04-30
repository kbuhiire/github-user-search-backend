require('dotenv').config()
const express = require("express");
const app = express();
const cors = require('cors')
const axios = require("axios").default;

const PORT = process.env.PORT;

axios.defaults.baseURL = "https://api.github.com";
axios.defaults.headers.common = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
};

app.use(cors())
app.use(express.json());

app.get("/users", async (req, res) => {
  const { name, per_page, page } = req.query;
  try {
    const response = await axios.get(`/search/users?q=${name}&per_page=${per_page}&page=${page}`);
    const promises = response.data.items.map(async (user) => {
      const userDetails = await getUserDetails(user.login);
      return {
        ...user,
        ...userDetails,
      };
    });
    const users = await Promise.all(promises);
    res.json({ total_count: response.data.total_count, items: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getUserDetails = async (userId) => {
  try {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    return error;
  }
};

app.listen(PORT, () => {
  console.log(`App is running on Port: ${PORT}`);
});
