// API wrapper with fallback to LocalStorage for zero-setup demo
const API_URL = 'http://localhost:5000/api';

const api = {
    async request(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const config = { method, headers };
            if (data) config.body = JSON.stringify(data);
            const response = await fetch(`${API_URL}${endpoint}`, config);
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.log(`Backend server not reachable for ${endpoint}. Using mock engine.`);
            return this.mockRequest(endpoint, method, data);
        }
    },

    // Mock engine for offline demo
    mockRequest(endpoint, method, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (endpoint === '/auth/login') {
                    if (data.email) {
                        const token = "mock_token_" + Date.now();
                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify({ name: "Demo User", email: data.email }));
                        resolve({ token, user: { name: "Demo User", email: data.email }});
                    } else reject({ error: "Invalid credentials" });
                }
                else if (endpoint === '/auth/register') {
                    resolve({ message: "Registered", token: "mock_token", user: { name: data.name }});
                }
                else if (endpoint === '/medicines' && method === 'GET') {
                    const meds = JSON.parse(localStorage.getItem('medicines') || '[]');
                    resolve(meds);
                }
                else if (endpoint === '/medicines' && method === 'POST') {
                    const meds = JSON.parse(localStorage.getItem('medicines') || '[]');
                    const newMed = { _id: Date.now(), ...data };
                    meds.push(newMed);
                    localStorage.setItem('medicines', JSON.stringify(meds));
                    resolve(newMed);
                }
                else if (endpoint === '/ai/symptoms') {
                    const str = (data.symptoms || "").toLowerCase();
                    let response = { riskLevel: "Low", prediction: "No major immediate risk detected.", recommendation: "Rest and hydrate."};
                    if (str.includes("chest") || str.includes("heart")) {
                         response = { riskLevel: "High", prediction: "Possible cardiovascular issue.", recommendation: "URGENT: Consult a doctor immediately."};
                    } else if (str.includes("headache") || str.includes("stress")) {
                         response = { riskLevel: "Medium", prediction: "High stress levels or migraine.", recommendation: "Take a break, reduce screen time."};
                    }
                    resolve(response);
                }
                else if (endpoint === '/ai/simulate') {
                    let futureRisk = "Stable";
                    let message = "If current habits continue, your health is expected to remain stable.";
                    if (data.sleep < 5 || data.exercise === "none" || data.diet === "poor") {
                        futureRisk = "High Blood Pressure Risk";
                        message = "WARNING: If current habits continue, risk of high blood pressure may increase by 65% in 6 months.";
                    } else if (data.sleep >= 7 && data.exercise === "regular" && data.diet === "good") {
                        futureRisk = "Excellent";
                        message = "Great job! Your trajectory shows a strong immune system in the upcoming year.";
                    }
                    resolve({ futureRisk, message });
                }
                else if (endpoint === '/emergency') {
                    resolve({ success: true, message: "Emergency alert sent!" });
                }
                else {
                    resolve({ status: "success" });
                }
            }, 600); // simulate network delay
        });
    }
};

// --- Demo Data Initialization ---
if (!localStorage.getItem('medicines_seeded')) {
    const demoMeds = [
        { _id: 1, name: "Lisinopril (Blood Pressure)", dosage: "10mg", time: "08:00 AM" },
        { _id: 2, name: "Vitamin D3", dosage: "2000 IU", time: "09:00 AM" },
        { _id: 3, name: "Atorvastatin (Cholesterol)", dosage: "20mg", time: "08:00 PM" }
    ];
    localStorage.setItem('medicines', JSON.stringify(demoMeds));
    localStorage.setItem('user', JSON.stringify({ name: "Alex Demo", email: "alex@demo.edu" }));
    localStorage.setItem('medicines_seeded', 'true');
}
