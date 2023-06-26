require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require('dns');

const mongoose = require('mongoose');
const mongoString = process.env.MONGO_URI;
mongoose.connect("mongodb+srv://juanmasilsca:1rHXWZE3yS6lMUhB@cluster0.kmccri2.mongodb.net/mongodb-and-mongoose");
const database = mongoose.connection;
database.on('error', (error) => {
  console.error(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});

// Basic Configuration
const port = process.env.PORT || 3000;

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: { type: String, required: true},
});


const Url = mongoose.model('Url', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let urls = [{ original_url: 'https://www.google.com', short_url: 1}];
let idCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:id', function (req, res) {
  const shortUrl = req.params.id;
  console.log(shortUrl);
  const indice = urls.findIndex(u => u.short_url == shortUrl);

  if (indice >= 0) {
    const url = urls[indice].original_url;
    res.redirect(url);
  } else {
    res.status(404).send('Not found...');
  }
});

app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const shortenUrl = url.replace(/^https?:\/\//, '');
    dns.lookup(shortenUrl, (err, address, family) => {
      if (err) {
        res.json({ error: 'invalid url' });
      }
    });
    const indice = urls.findIndex(el => el.original_url === url);
    if (indice >= 0) {
      res.json(urls[indice]);
    }
    const newUrl = { original_url: url, short_url: ++idCounter};
    urls.push(newUrl)
    res.json(newUrl);
  }
  res.json({ error: 'invalid url' }); 
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

exports.UrlModel = Url;
