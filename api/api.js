const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const helmet = require('helmet');
const cors = require('cors');
const fileUpload = require('express-fileupload'); 
const fs = require('fs');
// const config = require('../config/index');
const BoardController = require('./controllers/BoardController');
const BMIController = require('./controllers/BMIController');

const app = express()
// const server = https.Server(app);

app.use(cors());

app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(fileUpload());

// routes
// {email: }
app.post('/public/createBoard', async (req, res) => {
  try {
    const controller = new BoardController(req, res)
    await controller.fetchLink()
    await controller.shareBoard()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.name, detail: error.message})
  }
});

// { file multipart key bmi}
app.post('/public/uploadBMI', async (req, res) => {
  try {
    const controller = new BMIController(req, res)
    await controller.insertCSVToDB()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.name, detail: error.message})
  }
});

// { weight: , height: , sex: , birth: , measurement: , }
// height in cm
app.post('/public/BMIResult', async (req, res) => {
  try {
    const controller = new BMIController(req, res)
    await controller.getClassification()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.name, detail: error.message})
  }
});

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/apiparenaid.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/apiparenaid.xyz/fullchain.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/apiparenaid.xyz/chain.pem')
}, app).listen(443);
