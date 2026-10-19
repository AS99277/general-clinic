const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    patientName: String,
    phone: String,
    date: String,
    time: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

// Home Route - Patient UI
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GENERAL CLINIC - Booking</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            :root {
                --bg-color: #f0f4f8;
                --primary: #4facfe;
                --clay-bg: #ffffff;
                --clay-shadow: 20px 20px 40px #d1d9e6, -20px -20px 40px #ffffff;
                --clay-inner: inset 8px 8px 16px rgba(0, 0, 0, 0.05), inset -8px -8px 16px rgba(255, 255, 255, 0.8);
            }
            body {
                font-family: 'Poppins', sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
                background-attachment: fixed;
                color: #333;
                overflow-x: hidden;
            }
            .container {
                max-width: 900px;
                margin: 40px auto;
                padding: 20px;
                animation: fadeUp 1s ease-out;
            }
            /* Claymorphism Cards */
            .clay-card {
                background: var(--clay-bg);
                border-radius: 40px;
                box-shadow: var(--clay-shadow), var(--clay-inner);
                border: 2px solid rgba(255, 255, 255, 0.5);
                padding: 40px;
                margin-bottom: 30px;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }
            .clay-card::before {
                content: '';
                position: absolute;
                top: -50px; right: -50px;
                width: 150px; height: 150px;
                background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
                border-radius: 50%;
                z-index: 0;
                opacity: 0.3;
                animation: float 6s infinite ease-in-out;
            }
            .content-wrapper { position: relative; z-index: 1; }
            h1 { color: #2c3e50; font-size: 2.5rem; text-align: center; margin-bottom: 5px; }
            h2 { color: var(--primary); text-align: center; font-weight: 600; margin-top: 0; }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .info-item {
                background: rgba(255, 255, 255, 0.6);
                padding: 20px;
                border-radius: 25px;
                box-shadow: var(--clay-inner);
                display: flex;
                align-items: center;
                gap: 15px;
                transition: transform 0.3s;
            }
            .info-item:hover { transform: translateY(-5px); }
            .info-item i { font-size: 1.5rem; color: var(--primary); }
            
            /* Form Styles */
            .form-group { margin-bottom: 20px; }
            label { display: block; font-weight: 600; margin-bottom: 8px; margin-left: 10px; }
            input[type="text"], input[type="date"], input[type="time"] {
                width: 100%;
                padding: 15px;
                border-radius: 20px;
                border: none;
                background: #f8faff;
                box-shadow: inset 5px 5px 10px #e1e5ee, inset -5px -5px 10px #ffffff;
                font-family: 'Poppins', sans-serif;
                box-sizing: border-box;
                outline: none;
                transition: box-shadow 0.3s;
            }
            input:focus { box-shadow: inset 8px 8px 15px #d1d9e6, inset -8px -8px 15px #ffffff; }
            
            /* Clay Buttons */
            .clay-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 30px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 8px 8px 16px rgba(118, 75, 162, 0.4), var(--clay-inner);
                transition: transform 0.2s, box-shadow 0.2s;
                width: 100%;
                margin-top: 10px;
            }
            .clay-btn:hover {
                transform: scale(1.02) translateY(-2px);
                box-shadow: 10px 10px 20px rgba(118, 75, 162, 0.5), var(--clay-inner);
            }
            .doc-image {
                width: 120px; height: 120px;
                border-radius: 50%;
                object-fit: cover;
                margin: 0 auto 20px auto;
                display: block;
                box-shadow: var(--clay-shadow);
                border: 4px solid white;
            }
            
            /* Animations */
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
                100% { transform: translateY(0px); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="clay-card">
                <div class="content-wrapper">
                    <img src="https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=crop&w=300&q=80" alt="Doctor" class="doc-image">
                    <h1>GENERAL CLINIC</h1>
                    <h2>Dr. MR RINKU GOLA</h2>
                    <p style="text-align: center; color: #666; font-weight: 600;">GENERAL PHYSICIAN SPECIALIST</p>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <div>
                                <strong style="display:block;">Clinic Address</strong>
                                <small>KURI RAWANA, CHHAJLET, MORADABAD UP 244501</small>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-clock"></i>
                            <div>
                                <strong style="display:block;">Timings (Mon-Sat)</strong>
                                <small>8:00 AM - 7:00 PM</small>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa-brands fa-whatsapp"></i>
                            <div>
                                <strong style="display:block;">WhatsApp & Call</strong>
                                <small><a href="https://wa.me/917060969508" style="text-decoration:none; color:inherit;">+91 7060969508</a> / +91 9927766450</small>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-money-bill-wave"></i>
                            <div>
                                <strong style="display:block;">Payment Options</strong>
                                <small>Cash Only</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="clay-card">
                <div class="content-wrapper">
                    <h2 style="color: #764ba2; margin-bottom: 25px;"><i class="fa-regular fa-calendar-check"></i> Book an Appointment</h2>
                    <form action="/api/book" method="POST">
                        <div class="form-group">
                            <label>Patient Name</label>
                            <input type="text" name="patientName" placeholder="Enter full name" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" placeholder="+91 XXXXX XXXXX" required>
                        </div>
                        <div style="display:flex; gap: 20px;">
                            <div class="form-group" style="flex: 1;">
                                <label>Date</label>
                                <input type="date" name="date" required>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>Preferred Time</label>
                                <input type="time" name="time" required>
                            </div>
                        </div>
                        <button type="submit" class="clay-btn">Confirm Booking</button>
                    </form>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

// API Route - Handle Booking
app.post('/api/book', async (req, res) => {
    try {
        await connectDB();
        const { patientName, phone, date, time } = req.body;
        await Appointment.create({ patientName, phone, date, time });
        res.send(\`<script>alert('Appointment booked successfully for \${patientName}!'); window.location.href='/';</script>\`);
    } catch (error) {
        res.status(500).send("Error booking appointment. Please try again.");
    }
});

module.exports = app;
