require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
// Récupération du port et du lien de l'API
const port = process.env.PORT;
const api_link = process.env.API_LINK;

// Configuration de Pug comme moteur de template
app.set('view engine', 'pug');

// Configuration du dossier contenant les images
app.use('/images', express.static(__dirname + '/images'));

// Route pour la page d'accueil
app.get('/', async (req, res) => {
  try {
    const biere = await getBierePopulaire();
    res.render('index', { biere });
  } catch (error) {
    console.error(error);
    res.render('index', { biere: null });
  }
});

// Route pour obtenir la liste des bières
app.get('/liste-bieres', async (req, res) => {
  try {
    // Appel à l'API PunkAPI pour obtenir la liste des bières
    const response = await axios.get(api_link);
    const bieres = response.data;
    // Renvoie la liste des bières au format JSON
    res.render('liste-bieres', { bieres });
  } catch (error) {
    console.error(error);
    res.status(500).send('Une erreur est survenue');
  }
});

// Route pour obtenir la boisson du mois
app.get('/boisson-du-mois', async (req, res) => {
    try {
      const biere = await getBiereAleatoire();
      res.render('boisson-du-mois', { biere });
    } 
    catch (error) {
      console.error(error);
      res.render('boisson-du-mois', { biere: null });
    }
});

// Route pour obtenir les détails d'une bière
app.get('/biere/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(api_link + '/' + `${id}`);
    const biere = response.data[0];
    res.render('biere', { biere });
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Une erreur est survenue');
  }
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

io.on('connection', async (socket) => {
  console.log('Un utilisateur s\'est connecté');
  
  try {
    // Appel à l'API PunkAPI pour obtenir la liste des bières
    const response = await axios.get(api_link);
    const bieres = response.data;

    // Envoie la liste des bières aux clients connectés
    socket.emit('beers', bieres);
  } 
  catch (error) {
    console.error(error);
  }

  socket.on('chat message', (message, callback) => {
    let dateMessage = new Date();
    let jour = dateMessage.getDate();
    let mois = dateMessage.getMonth() + 1;
    let annee = dateMessage.getFullYear();
    let heure = dateMessage.getHours();
    let minutes = dateMessage.getMinutes();
    let formatDate = "[" + jour + "/" + mois + "/" + annee + " à " + heure + ":" + minutes + "] Serveur : ";
    console.log('Nouveau message reçu :', message);
    callback(formatDate + 'Votre message a bien été réceptionné !');
    socket.broadcast.emit('chat message', message);
  });
  
  
  

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});


// Fonction pour récupérer une bière aléatoire
async function getBiereAleatoire() {
  try {
    const response = await axios.get(api_link + '/random');
    const biere = response.data[0];
    return biere;
  } 
  catch (error) {
    console.error(error);
  }
}
// Fonction pour récupérer la bière populaire
const getBierePopulaire = async () => {
  try {
    const response = await axios.get(api_link);
    const bieresTriees = response.data.sort((a, b) => b.abv - a.abv);
    return bieresTriees[0];
  } 
  catch (error) {
    console.error(error);
  }
};

// Démarrage du serveur HTTP
http.listen(port, () => {
  console.log(`Le serveur est démarré sur le port ${port}`);
});