// app.js ou server.js
const express = require('express');
const cors = require('cors'); // Importer le middleware CORS
const sequelize = require('./config/database');
const User = require('./models/User');
const Emotion = require('./models/Emotion');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const app = express();

const allowedOrigins = ['https://launch.feelmap-app.com', 'http://localhost:5173']; // Liste des origines autorisées
// Configurer CORS pour permettre les requêtes depuis 'http://localhost:3000'
// Gérer manuellement les requêtes OPTIONS pour renvoyer un 200
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send('CORS preflight response'); // Renvoi un code 200 avec contenu
});

// Middleware CORS sans inclure OPTIONS
app.use(cors({
  origin: ['https://launch.feelmap-app.com', 'http://localhost:5173', 'https://www.launch.feelmap-app.com', 'launch.feelmap-app.com'], // Domaines autorisés
  methods: ['GET', 'POST', 'DELETE', 'PUT'], // Sans OPTIONS
  credentials: true, // Autoriser les cookies/headers d'autorisation
}));

// Middleware général pour ajouter les en-têtes CORS à toutes les requêtes


app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Vérifie si l'origine de la requête est dans la liste des origines autorisées
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'no-store'); // Désactive le cache
  next();
});




app.use(express.json());

// Route pour tester la connexion à la base de données
app.get('/test-connection', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('Connection to database successful');
  } catch (error) {
    res.status(500).send('Unable to connect to the database');
  }
});

app.get('/test', (req, res) => {
  res.send('CORS is working!');
});

// Route pour créer un nouvel utilisateur
app.post('/users', async (req, res) => {
  try {
    const newUser = await User.create({});
    res.json(newUser)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer toutes les données d'un utilisateur en passant son mot de passe
app.delete('/users/delete', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    // Trouver l'utilisateur avec le mot de passe fourni
    const user = await User.findOne({ where: { password } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Supprimer toutes les émotions associées à cet utilisateur
    await Emotion.destroy({ where: { userId: user.id } });

    // Supprimer l'utilisateur
    await User.destroy({ where: { id: user.id } });

    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route pour vérifier si un utilisateur existe
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si l'utilisateur avec cet ID existe
    const user = await User.findByPk(id);
    
    if (user) {
      // Si l'utilisateur existe, retourner un objet avec l'existence
      res.json({ exists: true });
    } else {
      // Si l'utilisateur n'existe pas, retourner un objet avec l'existence
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/verify-password', async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    // Trouver l'utilisateur avec le mot de passe fourni
    const user = await User.findOne({ 
      where: { 
        password 
      } 
    });

    if (user) {
      // Si l'utilisateur est trouvé, renvoyer l'identifiant
      res.json({ userId: user.id });
    } else {
      // Si aucun utilisateur n'est trouvé avec ce mot de passe
      res.status(404).json({ error: 'Password not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer toutes les émotions d'un utilisateur avec authentification par id et password
// Route pour récupérer toutes les émotions d'un utilisateur avec authentification par id et password
app.get('/emotions/all', async (req, res) => {
  try {
    const { id, password } = req.query;
    
    if (!id || !password) {
      return res.status(400).json({ error: 'Missing required query parameters: id and password' });
    }

    // Vérifier si l'utilisateur avec cet id et password existe
    const user = await User.findOne({ 
      where: { 
        id, 
        password 
      } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    // Récupérer toutes les émotions de cet utilisateur avec un maximum de 100 résultats
    const emotions = await Emotion.findAll({
      where: {
        userId: id,
      },
      order: [['emotionDate', 'DESC']], // Trier par date décroissante pour obtenir les plus récentes en premier
      limit: 100, // Limiter le nombre de résultats à 100
      raw: true
    });

    if (emotions.length === 0) {
      return res.status(404).json({ message: 'No emotions found for this user' });
    }

    // Retourner les émotions trouvées
    res.json(emotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Route pour créer une émotion
// Route pour créer une émotion
app.post('/emotions', async (req, res) => {
    try {
      const { userId, latitude, longitude, emotionName, description } = req.body;
  
      console.log(req.body.userId)
      // Vérifier si l'utilisateur existe
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      // Créer l'émotion
      const emotion = await Emotion.create({
        userId,
        latitude,
        longitude,
        emotionName,
        description,
      });
      res.json(emotion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


  app.get('/emotions', async (req, res) => {
    try {
      const { userId, month, year } = req.query;
      if (!userId || !month || !year) {
        return res.status(400).json({ error: 'Missing required query parameters' });
      }
  
      const startDate = new Date(year, month - 1, 1); // Début du mois
      const endDate = new Date(year, month, 0); // Fin du mois
  
      // Récupérer toutes les émotions du mois spécifié
      const emotions = await Emotion.findAll({
        where: {
          userId,
          emotionDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['emotionDate', 'DESC']], // Trier par date décroissante pour avoir les dernières émotions en premier
        limit: 200,
        raw: true
      });
  
      // Filtrer pour ne garder que la dernière émotion de chaque jour
      const latestEmotionsPerDay = [];
      const emotionMap = new Map(); // Utiliser une Map pour stocker la dernière émotion par jour
  
      emotions.forEach(emotion => {
        const emotionDay = new Date(emotion.emotionDate).toISOString().split('T')[0]; // Obtenir la date sans l'heure
        if (!emotionMap.has(emotionDay)) {
          emotionMap.set(emotionDay, emotion); // Si la date n'existe pas encore dans la map, on ajoute l'émotion
        }
      });
  
      // Transformer la Map en tableau
      emotionMap.forEach((emotion) => {
        latestEmotionsPerDay.push(emotion);
      });
  
      // Retourner les dernières émotions pour chaque jour
      res.json(latestEmotionsPerDay);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour récupérer toutes les émotions d'une journée pour un utilisateur
app.get('/emotions/day', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Convertir la date en début et fin de la journée
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Début de la journée à 00:00:00

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Fin de la journée à 23:59:59

    console.log("DAAAAAAAAAAAAAAAAAAAAAAA********")
    console.log(startDate)
    console.log(endDate)
    // Récupérer toutes les émotions de la journée spécifiée
    const emotions = await Emotion.findAll({
      where: {
        userId,
        emotionDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['emotionDate', 'DESC']], // Trier par date décroissante
      raw: true
    });

    console.log(emotions)
    
    // Retourner les émotions trouvées
    res.json(emotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
    
});

  
// Synchronisation des modèles avec la base de données
sequelize.sync({ force: false, }).then(() => {
  app.listen(3055, () => {
    console.log('Server is running on port 3055');
  });
}).catch(error => {
  console.error('Unable to connect to the database:', error);
});
