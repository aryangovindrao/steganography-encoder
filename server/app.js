require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const stegoRoutes = require('./routes/stegoRoutes');
app.use('/api/stego', stegoRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Steganography API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
