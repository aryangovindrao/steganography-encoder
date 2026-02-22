const fs = require('fs');
const path = require('path');
const { encodeMessage, decodeMessage, calculatePSNR, simulateJPEGCompression } = require('../utils/stegoUtils');

// Temporary in-memory storage for intermediate processing or response.
// In a real production app, save these to a secure database/S3 bucket or respond with streams.
// We'll write them to uploads/ so user can download.

exports.encode = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        const { message, password } = req.body;

        if (!message) return res.status(400).json({ error: 'No message provided' });

        const originalBuffer = req.file.buffer;

        // Encode
        const encodedBuffer = await encodeMessage(originalBuffer, message, password);

        // Calculate PSNR
        const psnr = await calculatePSNR(originalBuffer, encodedBuffer);

        // Provide back base64 for easy preview on frontend
        const originalBase64 = `data:${req.file.mimetype};base64,${originalBuffer.toString('base64')}`;
        const encodedBase64 = `data:image/png;base64,${encodedBuffer.toString('base64')}`;

        return res.status(200).json({
            success: true,
            psnr: psnr.toFixed(2),
            encodedImage: encodedBase64,
            originalImage: originalBase64
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || 'Error occurred during encoding' });
    }
};

exports.decode = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No encoded image provided' });
        const { password } = req.body;

        const encodedBuffer = req.file.buffer;

        // Decode
        const decodedMessage = await decodeMessage(encodedBuffer, password);

        return res.status(200).json({
            success: true,
            message: decodedMessage
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || 'Error occurred during decoding' });
    }
};

exports.compressAndTest = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });

        // We expect the original image, message, and password to test robustness
        const { message, password, quality } = req.body;
        const compressionQuality = parseInt(quality, 10) || 50;

        const originalBuffer = req.file.buffer;

        // 1. First encode the message
        const encodedBuffer = await encodeMessage(originalBuffer, message, password);

        // 2. Compress the image (simulate JPEG compression)
        const compressedBuffer = await simulateJPEGCompression(encodedBuffer, compressionQuality);
        const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

        // 3. Calculate PSNR between original and compressed
        const psnr = await calculatePSNR(originalBuffer, compressedBuffer);

        // 4. Try to decode the message from the compressed image
        let recoveredMessage = null;
        let decodedSuccess = false;
        try {
            recoveredMessage = await decodeMessage(compressedBuffer, password);
            // Validating success
            decodedSuccess = recoveredMessage === message;
        } catch (err) {
            decodedSuccess = false;
            recoveredMessage = "Failed to recover (Compression corrupted LSB data)";
        }

        return res.status(200).json({
            success: true,
            psnr: psnr.toFixed(2),
            compressedImage: compressedBase64,
            recoveredMessage: recoveredMessage,
            decodedSuccess: decodedSuccess
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || 'Error occurred during compression simulation' });
    }
};
