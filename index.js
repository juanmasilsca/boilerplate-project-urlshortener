require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require('dns');

const URL = require('url').URL;

// Basic Configuration
const port = process.env.PORT || 3000;


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

app.post('/api/shorturl', function (req, res, next) {
  const passedUrl = req.body.url;
  try {
    const newUrl = new URL(passedUrl);
    dns.lookup(newUrl.hostname, (err, address, family) => {
      if (err) {
        res.json({ error: 'Invalid URL' });
      } else {
        const indice = urls.findIndex(el => el.original_url === newUrl);
        if (indice >= 0) {
          res.json(urls[indice]);
        }
        const urlToPush = { original_url: newUrl, short_url: ++idCounter};
        urls.push(urlToPush)
        res.json(urlToPush);
      }
    });
  } catch (error) {
    res.json({ error: 'Invalid URL' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

