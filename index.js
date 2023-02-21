const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');

// Configuration de Pug comme moteur de template
app.set('view engine', 'pug');

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.render('index');
});

// Route pour obtenir la liste des bières
app.get('/liste-bieres', async (req, res) => {
  try {
    // Appel à l'API PunkAPI pour obtenir la liste des bières
    const response = await axios.get('https://api.punkapi.com/v2/beers');
    const beers = response.data;
    // Renvoie la liste des bières au format JSON
    res.render('liste-bieres', { beers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Une erreur est survenue');
  }
});

app.get('/boisson-du-mois', async (req, res) => {
    try {
      const beer = await getRandomBeer();
      res.render('boisson-du-mois', { beer });
    } catch (error) {
      console.error(error);
      res.render('boisson-du-mois', { beer: null });
    }
  });

  app.get('/biere/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const response = await axios.get(`https://api.punkapi.com/v2/beers/${id}`);
      const beer = response.data[0];
      res.render('biere', { beer });
    } catch (error) {
      console.error(error);
      res.status(500).send('Une erreur est survenue');
    }
  });

  app.get('/contact', (req, res) => {
    res.render('contact');
    io.on('connection', (socket) => {
        console.log('Un utilisateur s\'est connecté');
      
        socket.on('chat message', (message, callback) => {
          console.log('Nouveau message reçu :', message);
          callback('Message reçu !');
          socket.broadcast.emit('chat message', message);
        });
      
        socket.on('disconnect', () => {
          console.log('Un utilisateur s\'est déconnecté');
        });
      });
  });

// Configuration de Socket.io pour envoyer des données en temps réel
io.on('connection', async (socket) => {
    console.log('Un utilisateur s\'est connecté');
  
    try {
      // Appel à l'API PunkAPI pour obtenir la liste des bières
      const response = await axios.get('https://api.punkapi.com/v2/beers');
      const beers = response.data;
  
      // Envoie la liste des bières aux clients connectés
      socket.emit('beers', beers);
    } catch (error) {
      console.error(error);
    }
  
    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté');
    });
  });

// Démarrage du serveur HTTP
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Le serveur est démarré sur le port ${port}`);
});

async function getRandomBeer() {
    try {
      const response = await axios.get('https://api.punkapi.com/v2/beers/random');
      const beer = response.data[0];
      return beer;
    } catch (error) {
      console.error(error);
    }
  }