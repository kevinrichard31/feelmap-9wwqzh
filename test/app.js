const express = require('express');
const app = express();
const port = 3000;

// Route pour la racine (/) qui renvoie un message
app.get('/', (req, res) => {
  // Définition du message à renvoyer
  const message = "Bienvenue sur mon application Express!";

  // Utilisation de la méthode `send()` pour envoyer le message au client
  res.send(message);
});

// Démarrage du serveur et écoute sur le port spécifié
app.listen(port, () => {
  console.log(`L'application est en cours d'exécution sur le port ${port}`);
});