// callAiMatrix.js
const callAiMatrix = async (content, client) => {
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          // {
          //   role: "system",
          //   content: `à partir de ce texte, créer un json avec des variables personnalisées, créer une matrice sur les traits de personnalités et centres d'intérêts, pas d'espace à partir du texte utilisateur, tu auras plusieurs catégories : health, personality, interests, social, tu dois mettre un score(integer) de -1 ou 0 ou +1, affiche pas le zéro pour chaque trait /activités, renvoi que le json. Pour chaque catégorie ajoutée des variables, sois assez précis sur les variables. tout en anglais ajoute également un score à la fin du json, health_score, nutrition_score, physical_score, relaxation_score, mental_score,couple_love_score,best_friends_score,family_only_score,workmate_score toujours de -1 ou 0 ou +1 Ne te base que sur ce qui à été fait, interprète pas trop. ajoute "best" à la fin du json en format tableau pour les noms de variables les plus intéressantes pour l'utilisateur (3max) et pas besoin de score.Ajoute emotion_duration de 1 à 24 en heures, emotion_intensity de 1 à 3, emotion_pleasure de 0 à 3. Si une variable est à 0 ne l'affiche pas, ne duplique pas les variables. verifie chaque variable pour que tu sois pertinents le plus possible, utilise des noms famillier. ajoute brands_mentionned avec un score de -1 ou 0 ou 1, tout en minuscule. dans interests ne met que les trucs utiles. n'invente rien, si tu procastine bah c'est -1 c'est pas bien, pareil pour le reste. pour tout le calcul de score, la personne est seul sauf si elle mentionne des amis. La réponse doit être en JSON valide. Ne froisse pas l'utilisateur met que des trucs qu'il va aimer. Si il parle pas de physique, ne note pas les traits dont le texte fourni par l'utilisateur, ne juge pas, uniquement les faits. si quelqu'un dit coucou tu peux pas mettre -1 sur health_score par exemple`
          // },
          {
            role: "system",
            content: `From the user's text, create a JSON with custom variables, build a matrix on personality traits and interests, no spaces from the user text. You'll have several categories: health, personality, interests, social. Assign a score (integer) of -1, 0, or +1 for each trait/activity, but don't display zero values. Return only the JSON. For each category, add detailed variables and be specific. Everything should be in English. Also add final scores: health_score, nutrition_score, physical_score, relaxation_score, mental_score, couple_love_score, best_friends_score, family_only_score, workmate_score, always with values of -1, 0, or +1. Base your analysis only on what was actually done, don't over-interpret. Add "best" at the end of the JSON in array format for the most interesting variable names for the user (max 3) without scores. Add emotion_duration from 1 to 24 hours, emotion_intensity from 1 to 3, emotion_pleasure from 0 to 3. If a variable equals 0, don't display it. Don't duplicate variables. Verify each variable to be as relevant as possible, use familiar names. Add brands_mentioned with scores of -1, 0, or 1, all lowercase. In interests, only include useful items. Don't invent anything - if procrastinating, it's -1 because that's not good, same for other items. For all score calculations, assume the person is alone unless friends are mentioned. The response must be valid JSON. Don't upset the user - only include things they will like. If they don't mention physical traits, don't score traits not provided in the user's text. Don't judge, only facts. If someone says "hello," you can't assign -1 to health_score, for example.`
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
  