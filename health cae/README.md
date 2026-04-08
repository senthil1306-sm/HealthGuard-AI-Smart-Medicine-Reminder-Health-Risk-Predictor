# HealthGuard AI 🛡️

A complete AI-powered healthcare web application featuring a stunning premium UI, real-time dashboard, AI symptom checker, and predictive future simulation.

This project was built to be **Presentation Ready (Zero-Setup)** for college demos, while also including a robust **Full-Stack Node.js Backend**.

## 🚀 How to Run the Demo Immediately (Zero-Setup Mode)

You do not need to install anything to view the application and test its features.
1. Navigate to the `frontend/` folder.
2. Double-click on `index.html` to open it in your web browser.
3. The application will use an intelligent offline-fallback mock engine to simulate Server and Database interactions purely in your browser.
4. Test login, medicine additions, the Symptom AI checker, and the Future Simulator. Everything will work seamlessly.

## 🛠️ Full-Stack Backend Setup (Optional)
If you have Node.js and MongoDB installed, you can run the full backend API:

1. Open a terminal in the `backend/` folder.
2. Run `npm install` to install dependencies (Express, Mongoose, JWT, etc)
3. Ensure MongoDB is running locally on your computer (`mongodb://127.0.0.1:27017/healthguard`)
4. Run `npm start`
5. The API will start on `http://localhost:5000`
6. Open the `frontend/index.html` file in your browser, and the App will automatically connect to the real backend server instead of using the offline mock engine.

## 🧬 Features
- **Modern Premium UI**: Built with pure HTML/CSS/JS featuring glassmorphism, dynamic glowing gradients, and fluid charts using Chart.js.
- **Smart Dashboard**: Visualizes health data using line charts and tracks your upcoming medicine doses.
- **AI Symptom Checker**: Enter descriptions of your pain/issues and receive instant cardiovascular or stress-related risk predictions.
- **Future Simulator (Antigravity)**: A highly specialized interactive tool that predicts your chances of chronic diseases 6-12 months out based on your exact sleep patterns, diet, and exercise input today.
- **Emergency SOS**: A globally available pulse button to simulate dispatching emergency notifications.

## 📁 Project Structure
- **/frontend**: HTML, CSS, JS. Includes the `api.js` abstraction map that connects everything together.
- **/backend**: Node.js/Express server containing Authentication, Model schemas (User, Medicine, Syllabus) in Mongoose, and the REST API logic.
