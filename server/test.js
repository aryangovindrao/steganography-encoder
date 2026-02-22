const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const API_URL = `http://localhost:${PORT}/api/stego`;

async function runTests() {
    console.log('--- Starting Integration Tests ---');

    const testImagePath = path.join(__dirname, 'test_image.png');
    const encodedImagePath = path.join(__dirname, 'encoded_output.png');

    try {
        // 1. Generate a test image using Jimp locally
        console.log('[1/5] Generating a test image...');
        const Jimp = require('jimp');
        await new Promise((resolve, reject) => {
            new Jimp(100, 100, 0xFF0000FF, (err, image) => {
                if (err) return reject(err);
                image.write(testImagePath, resolve);
            });
        });
        console.log('Test image created at', testImagePath);

        // 2. Test /encode endpoint
        console.log('\n[2/5] Testing POST /encode...');
        const encodeForm = new FormData();
        encodeForm.append('image', fs.createReadStream(testImagePath));
        encodeForm.append('message', 'A'); // small message for 10x10
        encodeForm.append('password', 'supersafe123');

        const encodeRes = await axios.post(`${API_URL}/encode`, encodeForm, {
            headers: encodeForm.getHeaders()
        });

        console.log('Encode Response:', encodeRes.data.success ? 'Success' : 'Failed');
        console.log('PSNR:', encodeRes.data.psnr);

        // Save the encoded base64 back to a file to test decode
        const base64Data = encodeRes.data.encodedImage.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(encodedImagePath, base64Data, 'base64');
        console.log('Encoded image saved to', encodedImagePath);

        // 3. Test /decode endpoint
        console.log('\n[3/5] Testing POST /decode...');
        const decodeForm = new FormData();
        decodeForm.append('image', fs.createReadStream(encodedImagePath));
        decodeForm.append('password', 'supersafe123');

        const decodeRes = await axios.post(`${API_URL}/decode`, decodeForm, {
            headers: decodeForm.getHeaders()
        });

        console.log('Decode Response:', decodeRes.data.success ? 'Success' : 'Failed');
        console.log('Recovered Message:', decodeRes.data.message);

        if (decodeRes.data.message !== 'A') {
            throw new Error('Message recovery mismatch!');
        } else {
            console.log('✅ Decode verified successfully.');
        }

        // 4. Test /compress endpoint
        console.log('\n[4/5] Testing POST /compress (Robustness)...');
        const compressForm = new FormData();
        compressForm.append('image', fs.createReadStream(testImagePath));
        compressForm.append('message', 'A');
        compressForm.append('password', '');
        compressForm.append('quality', '50');

        const compressRes = await axios.post(`${API_URL}/compress`, compressForm, {
            headers: compressForm.getHeaders()
        });

        console.log('Compress Response:', compressRes.data.success ? 'Success' : 'Failed');
        console.log('Compressed PSNR:', compressRes.data.psnr);
        console.log('Decode Success After Compression:', compressRes.data.decodedSuccess);
        console.log('Recovered Data (corrupted):', compressRes.data.recoveredMessage.substring(0, 30) + '...');

        console.log('\n✅ All integration tests completed successfully.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
    } finally {
        // Cleanup
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
        if (fs.existsSync(encodedImagePath)) fs.unlinkSync(encodedImagePath);
    }
}

runTests();
