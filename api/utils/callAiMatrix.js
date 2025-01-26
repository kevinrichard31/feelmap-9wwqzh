// callAiMatrix.js
const callAiMatrix = async (content, client) => {
    try {
      const prompt = `
        Based on the following description, create a JSON with custom variables. Create a matrix with personality traits and interests.
        Do not display variables with a score of 0. For each category, include detailed variables:
        - detected_health_trait
        - detected_personality
        - detected_interest
        - social
        Add the following scores to the end of the JSON: health_score, nutrition_score, relaxation_score, mental_score (each with values -1 or +1).
        The final JSON should exclude variables with a score of 0 and should not duplicate variables.
        Format the response as JSON only, and add a "best" array containing the most interesting variable names (max 3).
        Here is the description: 
        "${content}"
      `;
  
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `à partir de ce texte, créer un json avec des variables personnalisées, créer une matrice sur les traits de personnalités et centres d'intérêts, pas d'espace à partir du texte utilisateur, tu auras plusieurs catégories : health, personality, interests, social, tu dois mettre un score(integer) de -1 ou 0 ou +1, affiche pas le zéro pour chaque trait /activités, renvoi que le json. Pour chaque catégorie ajoutée des variables, sois assez précis sur les variables. tout en anglais ajoute également un score à la fin du json, health_score, nutrition_score, relaxation_score, mental_score toujours de -1 ou 0 ou +1 Ne te base que sur ce qui à été fait, interprète pas trop. ajoute "best" à la fin du json en format tableau pour les noms de variables les plus intéressants VOIR drole (3max) et pas besoin de score.Ajoute emotion_duration de 1 à 24 en heures, emotion_intensity de 1 à 3, emotion_pleasure de 0 à 3. Si une variable est à 0 ne l'affiche pas, ne duplique pas les variables. verifie chaque variable pour que tu sois pertinents le plus possible, utilise des noms famillier. ajoute brands_mentionned avec un score de -1 ou 0 ou 1, tout en minuscule`
          },
          {
            role: "user",
            content: content,
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
      });
  
      // Directly parse the JSON response
      let aiResponseJson = completion.choices[0].message.content;
      console.log("🌱 - callAiMatrix - aiResponseJson:", aiResponseJson)
      return JSON.parse(aiResponseJson);
    } catch (error) {
      console.error(error);
      throw new Error("Une erreur est survenue lors de l'appel à l'IA.");
    }
  };
  
  module.exports = callAiMatrix;
  