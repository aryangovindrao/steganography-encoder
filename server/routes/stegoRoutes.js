const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const stegoController = require('../controllers/stegoController');

// All endpoints expect an image field named 'image'
router.post('/encode', upload.single('image'), stegoController.encode);
router.post('/decode', upload.single('image'), stegoController.decode);
router.post('/compress', upload.single('image'), stegoController.compressAndTest);

module.exports = router;
