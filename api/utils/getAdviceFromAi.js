// utils/aiUtils.js
async function getAdviceFromAI(description, client, userLang) {
    try {
      console.log('hello')
      const prompt = `Based on this description: '${description}', give the user super helpful piece of advice or compliment or just a basic response in ${userLang}. You are like his friend. Make it light, fun, and full of energy! be concise when you need to be, or go deeper if you really need to get involved. do not ask questions, user cannot respond.`;
  
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that gives advice based on provided text. Always use the given language"
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        store: true,
        max_tokens: 150,
      });
      console.log('testee')
      console.log(completion.choices[0].message.content)
      return completion.choices[0].message.content.trim();
  
    } catch (error) {
      console.error("Error getting advice from AI:", error);
      return null;
    }
  }
  
  module.exports = getAdviceFromAI;