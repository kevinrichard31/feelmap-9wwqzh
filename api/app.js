// app.js ou server.js
const express = require('express');
const cors = require('cors'); // Importer le middleware CORS
const sequelize = require('./config/database');
const User = require('./models/User'); // Modèle User
const Emotion = require('./models/Emotion'); // Modèle Emotion
const Traits = require('./models/Traits'); // Modèle Traits
const Lang = require('./models/Lang'); // Modèle Lang
const EmotionHasTraits = require('./models/EmotionHasTraits'); // Modèle EmotionHasTraits
const TraitsHasLang = require('./models/TraitsHasLang'); // Modèle TraitsHasLang
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const PlaceType = require('./models/PlaceType');

const OpenAI = require('openai');
const TraitsType = require('./models/TraitsType');
const callAiMatrix = require('./utils/callAiMatrix');
const translateTrait = require('./utils/translateTrait');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // La clé API d'OpenAI est récupérée depuis les variables d'environnement.
});

const app = express();

const allowedOrigins = ['https://launch.feelmap-app.com', 'http://localhost:5173', 'https://localhost', 'http://localhost', 'capacitor://localhost']; // Liste des origines autorisées
// Configurer CORS pour permettre les requêtes depuis 'http://localhost:3000'
// Gérer manuellement les requêtes OPTIONS pour renvoyer un 200
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send('CORS preflight response'); // Renvoi un code 200 avec contenu
});

// Middleware CORS sans inclure OPTIONS
app.use(cors({
  origin: ['https://launch.feelmap-app.com', 'http://localhost:5173', 'https://www.launch.feelmap-app.com', 'launch.feelmap-app.com', 'https://localhost', 'http://localhost', 'capacitor://localhost'], // Domaines autorisés
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // Sans OPTIONS
  credentials: true, // Autoriser les cookies/headers d'autorisation
}));

// Middleware général pour ajouter les en-têtes CORS à toutes les requêtes


app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Vérifie si l'origine de la requête est dans la liste des origines autorisées
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS, PATCH');
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
    let langCode = req.body.lang_id;  // Récupère le code de langue envoyé par le client
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Récupère l'adresse IP
    console.log(langCode)
    // Convertir le code de langue envoyé en minuscule pour éviter les problèmes de casse
    langCode = langCode.toLowerCase();

    // Recherche dans la table Lang si un code exact existe (en minuscule)
    let lang = await Lang.findOne({
      where: {
        code: langCode,  // Cherche un code de langue exact en minuscule
      }
    });

    // Si la langue exacte n'existe pas, tente de trouver une correspondance la plus proche
    if (!lang) {
      // Option 1: On peut simplement utiliser les deux premiers caractères du code (par ex., fr pour fr-CA)
      const langShortCode = langCode.split('-')[0];  // "fr" pour "fr-CA"
      lang = await Lang.findOne({
        where: {
          code: langShortCode,  // Cherche un code de langue plus court comme "fr" (en minuscule)
        }
      });
    }

    if (!lang) {
      return res.status(404).json({ error: 'Language not found' });  // Si aucune langue n'a été trouvée
    }

    // Crée un nouvel utilisateur avec l'ID de la langue trouvée
    const newUser = await User.create({
      ip_address: ipAddress,
      lang_id: lang.id,  // Utilise l'ID de la langue trouvée
    });

    res.json(newUser);  // Retourne le nouvel utilisateur
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
app.patch('/emotions/:id/place-type', async (req, res) => {
  console.log('Requête PATCH reçue');
  const { id } = req.params; // ID de l'émotion à mettre à jour
  const { userId, userPassword, placeTypeId } = req.body;
  console.log('Body reçu:', req.body);

  if (!userId || !userPassword || !placeTypeId) {
    console.log('Erreur: paramètres manquants');
    return res.status(400).json({ error: 'User ID, password, and placeTypeId are required' });
  }

  try {
    const user = await User.findOne({ where: { id: userId, password: userPassword } });
    console.log('Utilisateur trouvé:', user);
    if (!user) {
      return res.status(403).json({ error: 'Invalid user credentials' });
    }

    const emotion = await Emotion.findByPk(id);
    console.log('Émotion trouvée:', emotion);
    if (!emotion) {
      return res.status(404).json({ error: 'Emotion not found' });
    }

    if (emotion.userId != userId) {
      console.log("Erreur: l'utilisateur n'a pas le droit");
      return res.status(403).json({ error: 'You do not have permission to update this emotion' });
    }

    emotion.placeTypeId = placeTypeId;
    await emotion.save();

    console.log('Émotion mise à jour:', emotion);
    res.status(200).json({ message: 'Place type updated successfully', emotion });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour récupérer la dernière émotion d'un utilisateur
app.get('/emotions/last', async (req, res) => {
  const { userId, userPassword } = req.query;  // Récupération des paramètres de l'URL
  console.log(userId);
  console.log(userPassword);

  if (!userId || !userPassword) {
    return res.status(400).json({ error: 'User ID and password are required' });
  }

  try {
    // Récupérer la dernière émotion de l'utilisateur
    const lastEmotion = await Emotion.findOne({
      where: { userId },
      order: [['emotionDate', 'DESC']],
    });

    if (!lastEmotion) {
      return res.status(404).json({ message: 'No emotions found for this user' });
    }
    console.log(lastEmotion);
    res.json(lastEmotion);
  } catch (error) {
    console.error('Error fetching last emotion:', error);
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

app.get('/place-types', async (req, res) => {
  try {
    const placeTypes = await PlaceType.findAll();
    res.json(placeTypes);
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
    const { userId, latitude, longitude, emotionName, description, city, amenity, type } = req.body;

    // Vérification de l'existence de l'utilisateur
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Création immédiate de l'émotion avec des données de base
    const emotion = await Emotion.create({
      userId,
      latitude,
      longitude,
      emotionName,
      description,
      city,
      amenity,
      type,
      aiResponse: null // Temporairement null
    });

    // Répondre immédiatement au client
    res.json({ emotion });

    // Traitement asynchrone post-réponse
    (async () => {
      try {
        // Appel à l'IA pour générer la réponse
        const aiResponse = await callAiMatrix(description, client);

        // Mettre à jour l'émotion avec la réponse AI
        await Emotion.update(
          { aiResponse: aiResponse },
          { where: { id: emotion.id } }
        );

        // Traitement des traits
        const traitTypes = ['health', 'social', 'personality', 'interests', 'brands_mentionned'];
        const emotionHasTraitsData = [];

        for (const traitType of traitTypes) {
          const traitTypeRecord = await TraitsType.findOne({ where: { name: traitType } });

          if (traitTypeRecord && aiResponse[traitType]) {
            const traitsPromises = Object.entries(aiResponse[traitType]).map(async ([name, score]) => {
              try {
                // Trouver ou créer le trait
                let trait = await Traits.findOne({
                  where: { name, typeId: traitTypeRecord.id }
                });

                if (!trait) {
                  trait = await Traits.create({
                    name,
                    typeId: traitTypeRecord.id
                  });
                }

                // Ajouter les associations dans le tableau
                emotionHasTraitsData.push({
                  emotion_id: emotion.id,
                  traits_id: trait.id,
                  score: score
                });
              } catch (traitError) {
                console.error(`Error processing trait ${name}:`, traitError);
              }
            });

            await Promise.all(traitsPromises);
          }
        }

        // Insérer toutes les associations en une seule fois
        if (emotionHasTraitsData.length > 0) {
          await EmotionHasTraits.bulkCreate(emotionHasTraitsData, {
            updateOnDuplicate: ['score']
          });
        }

        // Traduction des traits
        const allTraitIds = emotionHasTraitsData.map(item => item.traits_id);
        const traitsToTranslate = await Traits.findAll({
          where: { id: allTraitIds },
        });

        const translationPromises = traitsToTranslate.map(async (trait) => {
          const translationResults = await translateTrait(trait.name, client, Lang);

          if (translationResults && translationResults.translations) {
            const langPromises = translationResults.allLangs.map(async (lang) => {
              const translatedName = translationResults.translations[lang.code];

              if (translatedName) {
                await TraitsHasLang.findOrCreate({
                  where: { 
                    traits_id: trait.id, 
                    lang_id: lang.id 
                  },
                  defaults: {
                    traits_id: trait.id,
                    lang_id: lang.id,
                    name: translatedName,
                  }
                });
              }
            });

            await Promise.all(langPromises);
          }
        });

        await Promise.all(translationPromises);

      } catch (processError) {
        console.error('Post-response processing error:', processError);
      }
    })();

  } catch (error) {
    console.error('Emotion creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

const emotionTraits = async() => {
  try {
    const { emotionId, userId } = req.query;

    // Vérification de l'existence de l'émotion
    const emotionExists = await Emotion.findByPk(emotionId);
    if (!emotionExists) {
      return res.status(400).json({ error: 'Emotion not found' });
    }

    // Vérification de l'existence de l'utilisateur pour récupérer la langue
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Langue de l'utilisateur
    const userLangId = user.lang_id;

    // Requête SQL pour récupérer les traits et les scores
    const query = `
      WITH best_traits AS (
        SELECT jsonb_array_elements_text(emotions."aiResponse"->'best') AS best_trait
        FROM emotions 
        WHERE id = :emotionId
      )
      SELECT traits.*, emotion_has_traits.score
      FROM best_traits
      JOIN traits ON traits.name = best_traits.best_trait
      JOIN emotion_has_traits ON emotion_has_traits.traits_id = traits.id
      JOIN emotions ON emotions.id = emotion_has_traits.emotion_id
      WHERE emotions.id = :emotionId;
    `;

    // Exécution de la requête pour récupérer les traits
    const traitsData = await sequelize.query(query, {
      replacements: { emotionId },
      type: sequelize.QueryTypes.SELECT,
    });

    // Récupérer la traduction des traits pour la langue de l'utilisateur
    const traitIds = traitsData.map(trait => trait.id);
    const translations = await TraitsHasLang.findAll({
      where: { lang_id: userLangId, traits_id: traitIds },
      attributes: ['traits_id', 'name']
    });

    // Mapper les traductions aux traits
    const translatedTraitsData = traitsData.map(trait => {
      const translation = translations.find(t => t.traits_id === trait.id);
      return {
        ...trait,
        translated_name: translation ? translation.name : trait.name // Utilisation du nom traduit s'il existe
      };
    });

    // Retourner les traits avec leurs traductions
    res.json({ traits: translatedTraitsData });
  } catch (error) {
    console.error('Error fetching emotion traits:', error);
    res.status(500).json({ error: error.message });
  }
}


app.get('/emotions', async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    console.log("🌱 - app.get - year:", year);
    console.log("🌱 - app.get - month:", month);
    console.log("🌱 - app.get - userId:", userId);

    if (!userId || !month || !year) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Calculer les dates de début et de fin du mois spécifié
    const startDate = new Date(year, month - 1, 1); // Mois indexé à 0
    const endDate = new Date(year, month, 0); // Dernier jour du mois spécifié
    endDate.setHours(23, 59, 59, 999);

    console.log("🌱 - app.get - startDate:", startDate);
    console.log("🌱 - app.get - endDate:", endDate);

    // Récupérer toutes les émotions du mois spécifié
    const emotions = await Emotion.findAll({
      where: {
        userId,
        emotionDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['emotionDate', 'DESC']], // Trier par date décroissante pour avoir les plus récentes en premier
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
sequelize.sync({
  // force: true,
  alter: true
}).then(() => {
  app.listen(3055, () => {
    console.log('Server is running on port 3055');
  });
}).catch(error => {
  console.error('Unable to connect to the database:', error);
});
