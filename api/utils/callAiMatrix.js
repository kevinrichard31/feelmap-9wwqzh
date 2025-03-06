// callAiMatrix.js
const callAiMatrix = async (content, client) => {
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `à partir de ce texte, créer un json avec des variables personnalisées, créer une matrice sur les traits de personnalités et centres d'intérêts, pas d'espace à partir du texte utilisateur, tu auras plusieurs catégories : health, personality, interests, social, tu dois mettre un score(integer) de -1 ou 0 ou +1, affiche pas le zéro pour chaque trait /activités, renvoi que le json. Pour chaque catégorie ajoutée des variables, sois assez précis sur les variables. tout en anglais ajoute également un score à la fin du json, health_score, nutrition_score, physical_score, relaxation_score, mental_score,couple_love_score,best_friends_score,family_only_score,workmate_score toujours de -1 ou 0 ou +1 Ne te base que sur ce qui à été fait, interprète pas trop. ajoute "best" à la fin du json en format tableau pour les noms de variables les plus intéressantes pour l'utilisateur (3max) et pas besoin de score.Ajoute emotion_duration de 1 à 24 en heures, emotion_intensity de 1 à 3, emotion_pleasure de 0 à 3. Si une variable est à 0 ne l'affiche pas, ne duplique pas les variables. verifie chaque variable pour que tu sois pertinents le plus possible, utilise des noms famillier. ajoute brands_mentionned avec un score de -1 ou 0 ou 1, tout en minuscule. dans interests ne met que les trucs utiles. n'invente rien, si tu procastine bah c'est -1 c'est pas bien, pareil pour le reste. pour tout le calcul de score, la personne est seul sauf si elle mentionne des amis. La réponse doit être en JSON valide`
          },
          {
            role: "user",
            content: content,
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 600
      });
  
      // Directly parse the JSON response
      let aiResponseJson = completion.choices[0].message.content;
      console.log('response')
      console.log(completion.choices[0].message)
      return JSON.parse(aiResponseJson);
    } catch (error) {
      console.error(error);
      throw new Error("Une erreur est survenue lors de l'appel à l'IA.");
    }
  };
  
  module.exports = callAiMatrix;
  