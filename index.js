import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function fibonacci(n) {
  let a = 0, b = 1, res = [];
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
}

function isPrime(x) {
  if (x < 2) return false;
  for (let i = 2; i * i <= x; i++) {
    if (x % i === 0) return false;
  }
  return true;
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcmArray(arr) {
  return arr.reduce((acc, val) => lcm(acc, val));
}

function hcfArray(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

async function aiResponse(question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: question }] }]
  };
  const res = await axios.post(url, payload);
  return res.data.candidates[0].content.parts[0].text.split(" ")[0];
}

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Only one key allowed"
      });
    }

    const key = keys[0];
    const value = body[key];
    let data;

    if (key === "fibonacci") {
      data = fibonacci(value);
    } else if (key === "prime") {
      data = value.filter(isPrime);
    } else if (key === "lcm") {
      data = lcmArray(value);
    } else if (key === "hcf") {
      data = hcfArray(value);
    } else if (key === "AI") {
      data = await aiResponse(value);
    } else {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Invalid key"
      });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: data
    });

  } catch (err) {
    res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: "Internal Server Error"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
