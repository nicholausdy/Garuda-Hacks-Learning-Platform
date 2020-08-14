const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');

const config = require('../config/index');
const BoardController = require('./controllers/BoardController');

const app = express()
const server = http.Server(app);

app.use(cors());

app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.get('/public/createBoard', async (req, res) => {
  try {
    const controller = new BoardController(req, res)
    await controller.fetchLink()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.name, detail: error.message})
  }
});

server.listen(config.port, () => { 
  console.log('Maid cafe is running at '.concat(config.port)); 
});
