const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const authController = require("./controllers/authController");
const taskController = require("./controllers/taskController");
const authMiddleware = require("./middleware/authMiddleware"); 


const app = express();


mongoose.connect("mongodb+srv://sanhector:salemmongo@hector.bjbn2.mongodb.net/?retryWrites=true&w=majority&appName=hector").then(() => {
  console.log("mongo connected");
}).catch((err) => console.log(err.message));


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use('/auth', authController);
app.use('/task',taskController);

app.get('/', (req, res) => {
  res.send('Server is healthy');
});

app.get('/verify', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Token is valid.' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
