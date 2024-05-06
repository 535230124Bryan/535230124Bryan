// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const rekeningRoutes = require('./routes/rekeningRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/api', rekeningRoutes);

mongoose.connect('mongodb://localhost:27017/demo-untar/rekening', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Terhubung ke database MongoDB');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
