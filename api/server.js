// Import modul yang dibutuhkan
const express = require("express");
const cors = require("cors");
const openAi = require("openai");
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

// Inisialisasi OpenAI
const openai = new openAi.OpenAI({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.JS_URL,
        "X-Title": process.env.JS_URL,
    }
})

// Fungsi untuk memanggil chatbot dengan pesan dan konteks
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

    try {
        // Split token
        const token = auth.split(" ")[1];

        // Verifikasi token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Definisi konteks chatbot
        const context = process.env.CONTEXT;
        const response = await callbot(message, context);

        res.status(200).json(
            {
                status: 200,
                response: response.content,
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