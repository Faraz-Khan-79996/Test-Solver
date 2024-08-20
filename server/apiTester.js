const Groq = require("groq-sdk");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const chatCompletion = await getGroqChatCompletion();
    console.log(chatCompletion.choices[0]?.message?.content || "No content received.");
  } catch (error) {
    console.error("Error fetching chat completion:", error);
  }
}

async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: "llama3-8b-8192",
  });
}

// Run the main function
main();
