// app.js ou server.js
const express = require('express');
const _ = require('lodash');
const cors = require('cors'); // Importer le middleware CORS
const sequelize = require('./config/database');
const User = require('./models/User'); // Modèle User
// Au démarrage de votre application
sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données établie avec succès'))
  .catch(err => console.error('Impossible de se connecter à la base de données:', err));
  sequelize.query('CREATE SCHEMA IF NOT EXISTS public;')
  .then(() => sequelize.sync())
  .catch(err => console.error('Erreur:', err));
const moment = require('moment');
const Lang = require('./models/Lang'); // Modèle Lang
const EmotionHasTraits = require('./models/EmotionHasTraits'); // Modèle EmotionHasTraits
const Traits = require('./models/Traits'); // Modèle Traits
const Emotion = require('./models/Emotion'); // Modèle Emotion
const TraitsHasLang = require('./models/TraitsHasLang'); // Modèle TraitsHasLang
const { Op, fn, col, literal, Sequelize, QueryTypes } = require('sequelize');
const PlaceType = require('./models/PlaceType');

const OpenAI = require('openai');
const TraitsType = require('./models/TraitsType');
const callAiMatrix = require('./utils/callAiMatrix');
const translateTrait = require('./utils/translateTrait');
const setupAssociations = require('./models/associations');
const getAdviceFromAI = require('./utils/getAdviceFromAi');
setupAssociations()
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


// Route pour récupérer tous les traits d'un utilisateur
app.get('/users/:userId/traits', async (req, res) => {
  const { userId } = req.params;
  const { timeRange } = req.query;  // Get timeRange from query parameters

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userLangId = user.lang_id;

    // Define whereClause for emotion date filtering
    let emotionDateWhereClause = {};
    switch (timeRange) {
      case 'last_7_days':
        emotionDateWhereClause.emotionDate = {
          [Op.gte]: moment().subtract(7, 'days').toDate(),
        };
        break;
      case 'this_month':
        emotionDateWhereClause.emotionDate = {
          [Op.gte]: moment().startOf('month').toDate(),
        };
        break;
      case 'last_month':
        emotionDateWhereClause.emotionDate = {
          [Op.gte]: moment().subtract(1, 'months').startOf('month').toDate(),
          [Op.lt]: moment().startOf('month').toDate(),
        };
        break;
      case 'last_3_months':
        emotionDateWhereClause.emotionDate = {
          [Op.gte]: moment().subtract(3, 'months').startOf('month').toDate(),
        };
        break;
      case 'today':
        emotionDateWhereClause.emotionDate = {
          [Op.gte]: moment().startOf('day').toDate(),
          [Op.lt]: moment().endOf('day').toDate(),
        };
        break;
      case 'all':
        // No filtering, get all data
        break;
      default:
        // Handle invalid timeRange (e.g., log an error, default to 'last_7_days', or return an error)
        console.warn(`Invalid timeRange: ${timeRange}.  Returning all data.`);
        // If you want to default to last 7 days, you can set the emotionDateWhereClause here.
        // emotionDateWhereClause.emotionDate = {
        //   [Op.gte]: moment().subtract(7, 'days').toDate(),
        // };
        break;
    }


    // 2. Récupérer toutes les émotions de l'utilisateur (seulement les IDs) WITH date filtering
    const emotions = await Emotion.findAll({
      where: { userId, ...emotionDateWhereClause },
      attributes: ['id'],
      raw: true,
    });

    // S'il n'y a pas d'émotions, on retourne un tableau vide
    if (emotions.length === 0) {
      return res.json({ traits: [] });
    }
    const emotionIds = emotions.map(emotion => emotion.id);

    // 3. Récupérer toutes les associations entre émotions et traits pour cet utilisateur
    const emotionHasTraits = await EmotionHasTraits.findAll({
      where: { emotion_id: emotionIds },
      attributes: ['traits_id', 'score'],
      raw: true,
    });

    if (emotionHasTraits.length === 0) {
      return res.json({ traits: [] });
    }

    // 4. Regrouper les scores par trait et les additionner
    const aggregatedScores = new Map();
    emotionHasTraits.forEach(item => {
      const traitId = item.traits_id;
      const score = item.score;

      if (!aggregatedScores.has(traitId)) {
        aggregatedScores.set(traitId, 0);
      }

      // Utilisation d'une valeur par defaut pour ne pas avoir de null si un score est null
      aggregatedScores.set(traitId, aggregatedScores.get(traitId) + (score || 0));
    });

    // 5. Extraire tous les ids de traits concernés
    const traitIds = Array.from(aggregatedScores.keys());


    // 6. Récupérer les infos des traits avec le type
    const traits = await Traits.findAll({
      where: { id: traitIds },
      include: [{
        model: TraitsType,
        attributes: ['name'],
      }],
      raw: true
    });


    // 7. Récupérer les traductions des traits pour la langue de l'utilisateur
    const translations = await TraitsHasLang.findAll({
      where: {
        lang_id: userLangId,
        traits_id: traitIds
      },
      attributes: ['traits_id', 'name'],
      raw: true
    });

    // 8. Map pour facilement retrouver la trad
    const translationMap = new Map();
    translations.forEach(t => {
      translationMap.set(t.traits_id, t.name);
    });

    // 9. Combiner les informations des traits, scores agrégés, traductions et le type
    const translatedTraits = traits.map(trait => {
      const translatedName = translationMap.get(trait.id);
      const aggregatedScore = aggregatedScores.get(trait.id)

      return {
        id: trait.id,
        name: trait.name,
        translated_name: translatedName || trait.name,
        score: aggregatedScore,
        type: trait['TraitsType.name']
      };
    });

    // 10. Retourner les traits traduits
    res.json({ traits: translatedTraits });
  } catch (error) {
    console.error('Error fetching user traits:', error);
    res.status(500).json({ error: error.message });
  }
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

    // Requête SQL pour récupérer les émotions dédupliquées
    const query = `
      WITH EmotionGroups AS (
  SELECT 
    e.id,
    e."userId",
    e.latitude,
    e.longitude,
    e."emotionName",
    e.description,
    e."emotionDate",
    e.city,
    e.amenity,
    e.type,
    e."placeTypeId",
    e."placeTypeOther",
    e."aiResponse",
    e.advice,
    (
      SELECT MIN(e2.id)  -- ID minimum pour regrouper les émotions proches
      FROM emotions e2
      WHERE 
        e2."userId" = e."userId"
        AND ST_DWithin(
          ST_MakePoint(e.longitude, e.latitude)::geography,
          ST_MakePoint(e2.longitude, e2.latitude)::geography,
          50  -- distance en mètres
        )
    ) AS group_id
  FROM emotions e
  WHERE 
    e."userId" = :userId
    AND e.latitude IS NOT NULL 
    AND e.longitude IS NOT NULL
),
RankedEmotions AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY group_id  -- Sélectionne une seule émotion par groupe de 50m
      ORDER BY "emotionDate" DESC  -- Prend la plus récente
    ) as rn
  FROM EmotionGroups
)
SELECT 
  id,
  "userId",
  latitude,
  longitude,
  "emotionName",
  description,
  "emotionDate",
  city,
  amenity,
  type,
  "placeTypeId",
  "placeTypeOther",
  advice
FROM RankedEmotions
WHERE rn = 1
ORDER BY "emotionDate" DESC
LIMIT 100;

    `;

    const emotions = await sequelize.query(query, {
      replacements: { userId: id },
      type: QueryTypes.SELECT
    });

    if (emotions.length === 0) {
      return res.status(404).json({ message: 'No emotions found for this user' });
    }

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
    const userExists = await User.findByPk(userId, {
      include: {
        model: Lang, // Inclure la relation Lang
      }
    });

    if (!userExists) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Récupérer la langue de l'utilisateur depuis la base de données
    if (!userExists.Lang || !userExists.Lang.code) {
      return res.status(400).json({ error: 'User language not found' });
    }
    const userLang = userExists.Lang.code;

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
      aiResponse: null,
      advice: null
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

        // Traitement des traits (comme avant)
        const traitTypes = ['health', 'social', 'personality', 'interests', 'brands_mentionned'];
        const emotionHasTraitsData = [];

        for (const traitType of traitTypes) {
          const traitTypeRecord = await TraitsType.findOne({ where: { name: traitType } });

          if (traitTypeRecord && aiResponse[traitType]) {
            const traitsPromises = Object.entries(aiResponse[traitType]).map(async ([name, score]) => {
              try {
                // Utiliser findOrCreate pour trouver ou créer le trait en une seule opération
                const [trait, created] = await Traits.findOrCreate({
                  where: {
                    name
                  },
                  defaults: {
                    name,
                    typeId: traitTypeRecord.id
                  }
                });

                // Ajouter les associations dans le tableau
                emotionHasTraitsData.push({
                  emotion_id: emotion.id,
                  traits_id: trait.id,
                  score: score
                });

                if (created) {
                  console.log(`Trait "${name}" created successfully.`);
                } else {
                  console.log(`Trait "${name}" found.`);
                }
              } catch (traitError) {
                console.error(`Error processing trait ${name}:`, traitError);
                console.error(`Failed to create or find trait "${name}".`, traitError);
                throw traitError; // Relancer l'erreur pour arrêter le processus si un trait échoue
              }
            });

            try {
              await Promise.all(traitsPromises);
            } catch (allTraitsError) {
              console.error(`Error processing traits for type ${traitType}:`, allTraitsError);
              return; // Arrêter le traitement des traits si une erreur se produit
            }
          }
        }

        // Insérer toutes les associations en une seule fois
        if (emotionHasTraitsData.length > 0) {
          const uniqueData = _.uniqBy(emotionHasTraitsData, item => `${item.emotion_id}-${item.traits_id}`);

          try {
            await EmotionHasTraits.bulkCreate(uniqueData, {
              updateOnDuplicate: ['score']
            });
            console.log(`${uniqueData.length} EmotionHasTraits records created/updated successfully.`);
          } catch (bulkCreateError) {
            console.error('Error during EmotionHasTraits.bulkCreate:', bulkCreateError);
            return; // Arrêter le processus si bulkCreate échoue
          }
        } else {
          console.log('No EmotionHasTraits records to create.');
        }

        // Traduction des traits
        const allTraitIds = emotionHasTraitsData.map(item => item.traits_id);

        // D'abord, trouver les traits qui n'ont aucune traduction
        const traitsWithTranslations = await TraitsHasLang.findAll({
          attributes: ['traits_id'],
          where: { traits_id: allTraitIds },
          group: ['traits_id']
        });

        const translatedTraitIds = traitsWithTranslations.map(t => t.traits_id);
        const untranslatedTraitIds = allTraitIds.filter(id => !translatedTraitIds.includes(id));

        // Si tous les traits sont déjà traduits, on arrête là
        if (untranslatedTraitIds.length === 0) {
          console.log('All traits are already translated.');
          //return;  On ne stoppe pas ici, on continue avec l'advice
        } else {


          const traitsToTranslate = await Traits.findAll({
            where: { id: untranslatedTraitIds },
          });

          const translationPromises = traitsToTranslate.map(async (trait) => {
            const translationResults = await translateTrait(trait.name, client, Lang);

            if (translationResults && translationResults.translations) {
              const langPromises = translationResults.allLangs.map(async (lang) => {
                const translatedName = translationResults.translations[lang.code];

                if (translatedName) {
                  try {
                    const [traitsHasLang, created] = await TraitsHasLang.findOrCreate({
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
                    if (created) {
                      console.log(`Translation for trait "${trait.name}" in language "${lang.code}" created successfully.`);
                    } else {
                      console.log(`Translation for trait "${trait.name}" in language "${lang.code}" found.`);
                    }

                  } catch (translationError) {
                    console.error(`Error translating trait "${trait.name}" to language "${lang.code}":`, translationError);
                  }
                }
              });

              try {
                await Promise.all(langPromises);
              } catch (allLangError) {
                console.error(`Error processing language translations for trait "${trait.name}":`, allLangError);
              }
            }
          });

          try {
            await Promise.all(translationPromises);
          } catch (allTranslationsError) {
            console.error('Error processing all translations:', allTranslationsError);
          }
        }

        // Appel à la fonction getAdviceFromAI et mise à jour de l'émotion
        try {
          const advice = await getAdviceFromAI(description, client, userLang); // Passer userLang depuis userExists.Lang.code
          console.log("🌱 - advice:", advice)

          if (advice) {
            await Emotion.update({ advice: advice }, { where: { id: emotion.id } });
            console.log(`Advice updated successfully for emotion id ${emotion.id}.`);
          } else {
            console.log(`No advice received for emotion id ${emotion.id}.`);
          }
        } catch (adviceError) {
          console.error('Error getting or updating advice:', adviceError);
        }
      } catch (processError) {
        console.error('Post-response processing error:', processError);
      }
    })();

  } catch (error) {
    console.error('Emotion creation error:', error);
    res.status(500).json({ error: error.message });
  }
});


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

app.get('/testemo', async (req, res) => {
  try {
    const { emotionId, userId } = req.query;

    // Vérification de l'existence de l'émotion
    const emotion = await Emotion.findByPk(emotionId);
    if (!emotion) {
      return res.status(400).json({ error: 'Emotion not found' });
    }

    // Vérification de l'existence de l'utilisateur pour récupérer la langue
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Langue de l'utilisateur
    const userLangId = user.lang_id;

    // Récupérer les noms des traits à partir du champ 'aiResponse' de l'émotion
    const bestTraits = emotion.aiResponse?.best || [];

    if (!Array.isArray(bestTraits) || bestTraits.length === 0) {
      return res.json({ traits: [] });
    }

    // Récupérer les traits correspondants et leurs scores
    const traitsData = await Traits.findAll({ // Utilisation de Traits
      where: {
        name: bestTraits,
      },
      include: [
        {
          model: EmotionHasTraits, // Utilisation de EmotionHasTrait
          as: 'EmotionHasTraits',
          where: { emotion_id: emotionId },
          attributes: ['score'],
        },
      ],
      attributes: ['id', 'name']
    });


    // Récupérer les ID des traits
    const traitIds = traitsData.map(trait => trait.id);

    // Récupérer les traductions des traits pour la langue de l'utilisateur
    const translations = await TraitsHasLang.findAll({
      where: {
        lang_id: userLangId,
        traits_id: traitIds
      },
      attributes: ['traits_id', 'name']
    });


    // Mapper les traductions aux traits
    const translatedTraitsData = traitsData.map(trait => {
      const translation = translations.find(t => t.traits_id === trait.id);
      return {
        id: trait.id,
        name: trait.name,
        translated_name: translation ? translation.name : trait.name,
        score: trait.EmotionHasTraits ? trait.EmotionHasTraits[0].score : null
      };
    });

    // Retourner les traits avec leurs traductions
    res.json({ traits: translatedTraitsData });
  } catch (error) {
    console.error('Error fetching emotion traits:', error);
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
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Récupérer l'utilisateur pour la langue
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const userLangId = user.lang_id;

    // Récupérer toutes les émotions de la journée spécifiée
    const emotions = await Emotion.findAll({
      where: {
        userId,
        emotionDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['emotionDate', 'DESC']],
    });

    // Transformer les émotions avec les infos des traits
    const emotionsWithTraits = await Promise.all(emotions.map(async (emotion) => {
      const emotionData = emotion.get();
      const bestTraits = emotion.aiResponse?.best || [];

      let traits = [];

      const traitsData = await Traits.findAll({
        include: [
          {
            model: EmotionHasTraits,
            as: 'EmotionHasTraits',
            where: { emotion_id: emotion.id }, // Get All related traits with emotionId
            attributes: ['score'],
          },
        ],
      });

      const filteredTraits = traitsData.filter(trait => bestTraits.includes(trait.name)); // Filter by bestTraits

      if (filteredTraits.length > 0) {
        const traitIds = filteredTraits.map(trait => trait.id);
        const translations = await TraitsHasLang.findAll({
          where: {
            lang_id: userLangId,
            traits_id: traitIds
          },
          attributes: ['traits_id', 'name']
        });

        traits = filteredTraits.map(trait => {
          const translation = translations.find(t => t.traits_id === trait.id);

          return {
            id: trait.id,
            name: trait.name,
            translated_name: translation ? translation.name : trait.name,
            score: trait.EmotionHasTraits[0].score
          };
        });
      }


      return {
        ...emotionData,
        traits: traits
      };
    }));


    // Retourner les émotions avec leurs traits
    res.json(emotionsWithTraits);
  } catch (error) {
    console.error('Error fetching emotions with traits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nouvelle route pour récupérer les scores agrégés d'un utilisateur
// Nouvelle route pour récupérer les sommes des scores d'un utilisateur
app.get('/users/:userId/aggregated-scores/:timeRange', async (req, res) => {
  const { userId, timeRange } = req.params; // Extract userId and timeRange from path parameters
  let startTime = process.hrtime.bigint();
  let endTime;

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let whereClause = { userId };

    // 2. Construct WHERE clause based on timeRange
    switch (timeRange) {
      case 'last_7_days':
        whereClause.emotionDate = {
          [Op.gte]: moment().subtract(7, 'days').toDate(),
        };
        break;
      case 'this_month':
        whereClause.emotionDate = {
          [Op.gte]: moment().startOf('month').toDate(),
        };
        break;
      case 'last_month':
        whereClause.emotionDate = {
          [Op.gte]: moment().subtract(1, 'months').startOf('month').toDate(),
          [Op.lt]: moment().startOf('month').toDate(),
        };
        break;
      case 'last_3_months':
        whereClause.emotionDate = {
          [Op.gte]: moment().subtract(3, 'months').startOf('month').toDate(),
        };
        break;
      case 'today':
        whereClause.emotionDate = {
          [Op.gte]: moment().startOf('day').toDate(),
          [Op.lt]: moment().endOf('day').toDate(),
        };
        break;
      case 'all':
        // No filtering, get all data
        break;
      default:
        return res.status(400).json({ error: 'Invalid time range specified' });
    }

    // 3. Utiliser la fonction SUM avec CAST pour convertir les valeurs JSON en nombres
    const result = await Emotion.findOne({
      where: whereClause,
      attributes: [
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'health_score\' AS FLOAT)')
        ), 0), 'health_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'mental_score\' AS FLOAT)')
        ), 0), 'mental_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'physical_score\' AS FLOAT)')
        ), 0), 'physical_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'nutrition_score\' AS FLOAT)')
        ), 0), 'nutrition_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'relaxation_score\' AS FLOAT)')
        ), 0), 'relaxation_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'couple_love_score\' AS FLOAT)')
        ), 0), 'couple_love_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'best_friends_score\' AS FLOAT)')
        ), 0), 'best_friends_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'family_only_score\' AS FLOAT)')
        ), 0), 'family_only_score'],
        [fn('COALESCE', fn('SUM',
          literal('CAST("aiResponse"->\'workmate_score\' AS FLOAT)')
        ), 0), 'workmate_score'],
        [fn('COUNT', literal('*')), 'total_emotions']
      ],
      raw: true,
      logging: (sql) => {
        endTime = process.hrtime.bigint();
      },
      logQueryParameters: true
    });

    // Calculer le temps en millisecondes avec 3 décimales
    const executionTime = Number(endTime - startTime) / 1_000_000;

    // 4. Retourner les sommes des scores avec le temps d'exécution
    res.json({
      health_score: parseFloat(result.health_score),
      mental_score: parseFloat(result.mental_score),
      physical_score: parseFloat(result.physical_score),
      nutrition_score: parseFloat(result.nutrition_score),
      relaxation_score: parseFloat(result.relaxation_score),
      couple_love_score: parseFloat(result.couple_love_score),
      best_friends_score: parseFloat(result.best_friends_score),
      family_only_score: parseFloat(result.family_only_score),
      workmate_score: parseFloat(result.workmate_score),
      total_emotions: parseInt(result.total_emotions),
      query_time_ms: executionTime.toFixed(3),
    });
  } catch (error) {
    console.error('Error fetching and aggregating user scores:', error);
    res.status(500).json({ error: error.message });
  }
});
// Synchronisation des modèles avec la base de données
sequelize.sync({
  // force: true,
  alter: true,
  logging: false
}).then(() => {
  app.listen(3055, () => {
    console.log('Server is running on port 3055');
  });
}).catch(error => {
  console.error('Unable to connect to the database:', error);
});
