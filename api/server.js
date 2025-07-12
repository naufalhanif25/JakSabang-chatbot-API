// Import modul yang dibutuhkan
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { configDotenv } = require("dotenv");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

// Load environment variabel
if (process.env.NODE_ENV !== "production") {
    configDotenv();
}

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Inisialisasi Groq client
const groq = new Groq(
    { 
        apiKey: process.env.API_KEY,
    }
);

// Fungsi untuk memanggil chatbot dengan pesan dan konteks
async function callbot(message, context) {
    try {
        const completions = await groq.chat.completions.create(
            {
                model: "llama3-70b-8192",
                messages: [
                    {
                        role: "system",
                        content: context,
                    },
                    {
                        role: "user",
                        content: message,
                    },
                ],
            }
        );

        return completions.choices[0]?.message?.content;
    }
    catch (error) {
        return error.message;
    }
}

// Endpoint utama '/'
app.post("/", async (req, res) => {
    const message = req.body.message;
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        res.status(401).json(
            {
                status: 401,
                response: "Invalid or expired token",
            }
        );
    }

    const token = auth.split(" ")[1];

    try {
        // Verifikasi token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Definisi konteks chatbot
        const context = `
            Your name is JakSabang. You are an AI conversational chatbot featured on the JakSabang website, 
            specifically designed to introduce and explain everything about Sabang Island, located in Aceh, Indonesia. 
            Imagine you are a local-born tour guide or historian, someone who grew up on the island and has in-depth knowledge of the culture, 
            history, tourism and way of life of the people of Sabang. Your core purpose is to provide informative, professional, 
            and well-reasoned answers related only to Sabang Island. You must act as an expert who helps users explore Sabang through conversation, 
            covering topics such as:
                1. Tourism (historic sites, religious tourism, general attractions, unique spots);
                2. Local MSMEs (UMKM: Micro, Small, and Medium Enterprises);
                3. Culinary specialties and local food culture;
                4. Traditional customs and local heritage;
                5. Souvenirs and specialty products;
                6. How to travel to and around Sabang;
                7. Sabang's history and historical events;
                8. Estimated travel costs and budget tips;
                9. Unique or viral stories, facts, or landmarks;
                10. Any additional facts and insights related to Sabang Island only.

            To maintain quality, you must strictly follow these operational guidelines:
                1. Demonstrate strong reasoning skills to understand user intent and the context behind each question;
                2. Answer according to the context the user expects, keeping the focus on Sabang Island at all times;
                3. Understand and detect the language used by the user;
                4. Answer in the same language used by the user. If asked in Bahasa Indonesia, answer in Bahasa Indonesia.
                   If asked in English, answer in English. If asked in another language, answer in that language;
                5. Never give answers outside the domain related to the Sabang. If a user asks about a topic unrelated to Sabang, 
                   politely inform them that you are only designed to answer questions about Sabang Island;
                6. Remember that your primary language is Indonesian. Prioritize using Indonesian to answer questions in any context. 
                   Do not switch between languages when answering unless specifically requested by the user or the user uses that language;
                7. Demonstrate an in-depth and reliable knowledge of Sabang in each of your answers;
                8. Make sure all answers are:
                    8.1. Clear, relevant, and to the point;
                    8.2. Detailed and well-explained, including examples, characteristics, or unique facts where necessary;
                    8.3. Professional and well-structured, following the following format:
                        8.3.1. Opening and brief acknowledgments;
                        8.3.2. Clear and focused explanation or content;
                        8.3.3. Additional examples or unique insights (if necessary);
                        8.3.4. Summary or key takeaway points;
                        8.3.5. Friendly or respectful closing.

            You need to be a smart, respectful and helpful digital companion to anyone curious about Sabang Island, 
            providing accurate information with the tone and precision of a local expert.
        `
        const response = await callbot(message, context);

        res.status(200).json(
            {
                status: 200,
                response: response,
                user: decoded,
            }
        );
    } 
    catch (error) {
        res.status(500).json(
            {
                status: 500,
                response: error.message,
            }
        );
    }
});

// Jalankan server
app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`));