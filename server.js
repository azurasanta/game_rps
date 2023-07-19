require('dotenv').config();

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const https = require('https');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const socketContoller = require('./socketController.js');

const app = express();

const server = app.listen(process.env.PORT, () =>
  console.log(`server running on port ${process.env.PORT}`)
);

const io = socketContoller.socketio(server, { origins: '*:*' });

app.use(function(req, res, next) {
  req.io = io;
  next();
});

var corsOptions = {
  origin: 'https://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  optionsSuccessStatus: 200
};

const adminAuthRoutes = require('./routes/admin_auth.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const landingRoutes = require('./routes/landing.routes');
const uploadRoutes = require('./routes/upload.routes');
const gameRoutes = require('./routes/game.routes');
const questionRoutes = require('./routes/admin_question.routes');
const brainGameTypeRoutes = require('./routes/admin_brain_game_type.route');
const stripeRoutes = require('./routes/stripe.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const systemSetting = require('./routes/settings.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(cors(corsOptions));
app.use(cors());

app.use(express.json({ extended: false }));
app.use(fileUpload());

// Connect Database
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log(`***mongodb connected`))
  .catch(err => console.log(err));

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/brain_game_type', brainGameTypeRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/settings', systemSetting);

// Set static folder
app.use(express.static('client/build'));

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
// });
// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   // Set static folder
//   app.use(express.static('client/build'));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }
