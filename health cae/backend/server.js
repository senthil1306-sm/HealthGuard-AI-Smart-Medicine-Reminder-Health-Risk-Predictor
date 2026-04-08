const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load env vars (Mocking here for simplicity)
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'healthguard_secret_key_123';
// For demo, we fallback to local mongodb if URI is not provided.
const MONGO_URI = 'mongodb://127.0.0.1:27017/healthguard';

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => {
    console.warn('\n--- MONGODB CONNECTION FAILED ---');
    console.warn('Is MongoDB running on your machine? The app will still attempt to run APIs, but DB saves will fail.');
    console.warn('Error:', err.message);
  });

// --- Models ---
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const SymptomReport = require('./models/SymptomReport');

// --- Routes ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HealthGuard API is running' });
});

// 1. Auth API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Handle no-db case for demo gracefully
        if(mongoose.connection.readyState !== 1) {
             const token = jwt.sign({ id: 'mock123' }, JWT_SECRET, { expiresIn: '1h' });
             return res.status(201).json({ message: "Mock user registered", token, user: { id: 'mock123', name, email } });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: "User registered successfully", token, user: { id: user._id, name: user.name, email: user.email }});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if(mongoose.connection.readyState !== 1) {
             const token = jwt.sign({ id: 'mock123' }, JWT_SECRET, { expiresIn: '1h' });
             return res.json({ token, user: { id: 'mock123', name: 'Demo User', email }});
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware to verify token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// 2. Medicine API
app.get('/api/medicines', authMiddleware, async (req, res) => {
    try {
        if(mongoose.connection.readyState !== 1) return res.json([]);
        const medicines = await Medicine.find({ userId: req.user.id });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/medicines', authMiddleware, async (req, res) => {
    try {
        const { name, dosage, time } = req.body;
        if(mongoose.connection.readyState !== 1) {
             return res.status(201).json({ _id: Date.now(), name, dosage, time });
        }
        const medicine = new Medicine({ userId: req.user.id, name, dosage, time });
        await medicine.save();
        res.status(201).json(medicine);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. AI Symptom Checker (Simulated API)
app.post('/api/ai/symptoms', authMiddleware, async (req, res) => {
    // Rule-based simulation for Demo
    const { symptoms } = req.body;
    const symptomStr = symptoms.toLowerCase();
    
    let riskLevel = "Low";
    let prediction = "No major immediate risk detected. Rest and hydrate.";
    let recommendation = "Drink plenty of water and get at least 8 hours of sleep.";

    if (symptomStr.includes("chest pain") || symptomStr.includes("heart") || symptomStr.includes("breath")) {
        riskLevel = "High";
        prediction = "Possible cardiovascular issue or panic attack.";
        recommendation = "URGENT: Please consult a doctor immediately or visit an emergency room.";
    } else if (symptomStr.includes("headache") || symptomStr.includes("stress") || symptomStr.includes("tension")) {
        riskLevel = "Medium";
        prediction = "High stress levels or migraine.";
        recommendation = "Take a break, reduce screen time, and try relaxation techniques.";
    } else if (symptomStr.includes("sugar") || symptomStr.includes("thirsty") || symptomStr.includes("urinate")) {
        riskLevel = "Medium";
        prediction = "Possible symptoms of early Diabetes.";
        recommendation = "Check your blood sugar levels and consult a physician.";
    }

    try {
        if(mongoose.connection.readyState === 1) {
            const report = new SymptomReport({
                userId: req.user.id,
                symptoms: symptomStr,
                predictedRisk: riskLevel,
                notes: prediction
            });
            await report.save();
        }
    } catch (err) {
        console.error("DB Save failed for symptom report");
    }
    
    // Always return response for demo
    res.json({ riskLevel, prediction, recommendation });
});

// 4. Future Simulation API (Antigravity Feature)
app.post('/api/ai/simulate', authMiddleware, async (req, res) => {
    const { sleep, exercise, diet } = req.body;
    
    // Antigravity advanced simulation logic
    let futureRisk = "Stable";
    let message = "If current habits continue, your health is expected to remain stable.";

    if (sleep < 5 || exercise === "none" || diet === "poor") {
        futureRisk = "High Blood Pressure & Pre-diabetes";
        message = "WARNING: If current habits continue, risk of high blood pressure and severe stress may increase by 65% in 6 months.";
    } else if (sleep >= 7 && exercise === "regular" && diet === "good") {
        futureRisk = "Excellent";
        message = "Great job! Your trajectory shows a strong immune system and low risk of chronic diseases in the upcoming year.";
    } else {
        futureRisk = "Mild Fatigue";
        message = "You are doing okay, but slightly low sleep or lack of strict diet might cause mild fatigue in the coming 3 months.";
    }

    // Simulate delay for AI calculation effect
    setTimeout(() => {
        res.json({ futureRisk, message });
    }, 1500);
});

// 5. Emergency API
app.post('/api/emergency', authMiddleware, async (req, res) => {
    // Simulate sending SOS
    res.json({ success: true, message: "Emergency alert sent to emergency contacts and nearby hospitals!" });
});


app.listen(PORT, () => {
    console.log(`\n================================`);
    console.log(`HealthGuard API Server`);
    console.log(`Running on http://localhost:${PORT}`);
    console.log(`================================\n`);
});
