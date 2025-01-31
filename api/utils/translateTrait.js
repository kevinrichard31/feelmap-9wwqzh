// translateTrait.js
async function translateTrait(traitName, client, Lang) {
    console.log(traitName)
    try {
        // Récupérer toutes les langues depuis la base de données
        const allLangs = await Lang.findAll();

        if (!allLangs || allLangs.length === 0) {
            console.warn("No languages found in the database.");
            return null;
        }

        // Préparer le prompt pour l'IA avec toutes les langues
        const prompt = `Translate the following trait var "${traitName}" into name with these languages: ${allLangs
            .map(lang => `${lang.code} (for ${lang.name})`)
            .join(', ')}. Return a JSON object where the keys are language codes and the values are the translated names.`;

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that translates words in different languages, transforme bien les nom de variable en nom et traduit, remplace les _ par des espaces"
                },
                {
                    role: "user",
                    content: prompt,
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 500 // augmenter max_tokens
        });

        let translatedNames;
        try {
            translatedNames = JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Error parsing JSON from AI response:", completion.choices[0].message.content, error);
            return null;
        }

        // Retourner un objet avec les traductions pour chaque langue
        return {
            translations: translatedNames,
            allLangs
        };
    } catch (error) {
        console.error("Error in translation:", error);
        return null;
    }
}

module.exports = translateTrait;
