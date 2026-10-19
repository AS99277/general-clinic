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

// Appointment Schema Definition required for Admin too
const appointmentSchema = new mongoose.Schema({
    patientName: String,
    phone: String,
    date: String,
    time: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

// Admin Dashboard UI
app.get('/admin', async (req, res) => {
    await connectDB();
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    let tableRows = '';
    appointments.forEach((apt) => {
        tableRows += `
            <tr>
                <td>${apt.patientName}</td>
                <td>${apt.phone}</td>
                <td>${apt.date} <br> <small>${apt.time}</small></td>
                <td><span class="badge ${apt.status.toLowerCase()}">${apt.status}</span></td>
                <td>
                    <form action="/admin/update/${apt._id}" method="POST" style="display:inline;">
                        <button type="submit" class="action-btn success">✔</button>
                    </form>
                    <form action="/admin/delete/${apt._id}" method="POST" style="display:inline;">
                        <button type="submit" class="action-btn danger">✖</button>
                    </form>
                </td>
            </tr>
        `;
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>General Clinic - Admin Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --clay-inner: inset 8px 8px 16px rgba(0, 0, 0, 0.05), inset -8px -8px 16px rgba(255, 255, 255, 0.8);
            }
            body {
                font-family: 'Poppins', sans-serif;
                background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
                background-attachment: fixed;
                margin: 0; padding: 40px 20px;
            }
            .container {
                max-width: 1000px; margin: auto;
                background: rgba(255, 255, 255, 0.85);
                border-radius: 40px;
                padding: 40px;
                box-shadow: 20px 20px 40px rgba(0,0,0,0.1), -20px -20px 40px rgba(255,255,255,0.5), var(--clay-inner);
                backdrop-filter: blur(10px);
                animation: fadeUp 1s ease-out;
            }
            h1 { text-align: center; color: #333; margin-top: 0; }
            table { width: 100%; border-collapse: separate; border-spacing: 0 15px; margin-top: 20px; }
            th { text-align: left; padding: 15px; color: #555; }
            td { 
                background: #f8faff; padding: 15px;
                box-shadow: inset 4px 4px 8px #e1e5ee, inset -4px -4px 8px #ffffff;
            }
            tr td:first-child { border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
            tr td:last-child { border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
            
            .badge { padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
            .badge.pending { background: #ffeaa7; color: #d63031; }
            .badge.completed { background: #55efc4; color: #00b894; }
            
            .action-btn { 
                border: none; border-radius: 50%; width: 35px; height: 35px; 
                cursor: pointer; color: white; font-weight: bold;
                box-shadow: 4px 4px 8px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.4);
                transition: 0.2s;
            }
            .action-btn:hover { transform: scale(1.1); }
            .success { background: #00b894; }
            .danger { background: #d63031; }
            
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Dr. MR RINKU GOLA'S Appointments</h1>
            <table>
                <thead>
                    <tr>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" style="text-align:center;">No appointments yet!</td></tr>'}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

// Update Status Route
app.post('/admin/update/:id', async (req, res) => {
    await connectDB();
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'Completed' });
    res.redirect('/admin');
});

// Delete Appointment Route
app.post('/admin/delete/:id', async (req, res) => {
    await connectDB();
    await Appointment.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});

module.exports = app;
