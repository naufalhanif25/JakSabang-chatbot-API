// Import modul yang dibutuhkan
const express = require("express");
const cors = require("cors");
const openAi = require("openai");
const { configDotenv } = require("dotenv");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const googleAi = require("@google/genai");
const GroqLib = require("groq-sdk");
const Groq = GroqLib.Groq;

// Load environment variabel
if (process.env.NODE_ENV !== "production") {
    configDotenv();
}

const groq = new Groq({
    apiKey: process.env.GROQ_API
})

const GoogleGenAI = googleAi.GoogleGenAI;
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})
const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Inisialisasi OpenAI
const openai = new openAi.OpenAI({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.JS_URL,
        "X-Title": process.env.JS_URL,
    }
})

// Fungsi untuk memanggil chatbot open router dengan pesan dan konteks
async function callbot(message, context) {
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.MODEL,
            reasoning_effort: "high",
            messages: [
                {
                    role: "system",
                    content: context
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        return completion.choices[0].message;
    }
    catch (error) {
        return error.message;
    }
}

async function callGroq(message, context) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: message
            },
            {
                role: "system",
                content: context
            }
        ],
        model: process.env.GROQ_MODEL
    });

    return chatCompletion.choices[0]?.message?.content
}

// Fungsi untuk memanggil chatbot gemini dengan pesan dan konteks
async function callGemini(message, context) {
    try {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: context + "\n\n" + message,
        })

        return response.text;
    }
    catch (error) {
        return error.message;
    }
}

// Endpoint utama '/'
app.post("/", async (req, res) => {
    const message = req.body.message;
    // const auth = req.headers.authorization;

    // if (!auth || !auth.startsWith("Bearer ")) {
    //     res.status(401).json(
    //         {
    //             status: 401,
    //             response: "Invalid or expired token",
    //         }
    //     );
    // }

    try {
        // // Split token
        // const token = auth.split(" ")[1];

        // // Verifikasi token JWT
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Model yang digunakan
        const model = process.env.USE;
        
        // Definisi konteks chatbot
        const context = process.env.CONTEXT;
        // const response = (model === "gemini" ? await callGemini(message, context) : model === "open-router" ? await callbot(message, context) : model === "groq" ? callGroq(message, context) : "Model is undefined");

        const response = await callGroq(message, context);
        res.status(200).json(
            {
                status: 200,
                response: response,
                model: model,
                // user: decoded,
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