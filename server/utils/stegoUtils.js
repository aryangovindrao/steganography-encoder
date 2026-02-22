const Jimp = require('jimp');
const CryptoJS = require('crypto-js');

const DELIMITER = '1111111111111110'; // 16 bits of delimiter

function textToBinary(text) {
  return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function binaryToText(binary) {
  const chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    chars.push(String.fromCharCode(parseInt(binary.substring(i, i + 8), 2)));
  }
  return chars.join('');
}

// LSB Embedding
async function encodeMessage(imageBuffer, message, password) {
  let finalMessage = message;

  if (password) {
    finalMessage = CryptoJS.AES.encrypt(message, password).toString();
  }

  const binaryMessage = textToBinary(finalMessage) + DELIMITER;

  const image = await Jimp.read(imageBuffer);
  let messageIndex = 0;

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Checking capacity
  if (binaryMessage.length > width * height * 3) {
    throw new Error('Image is too small to contain this message');
  }

  // Iterate over pixels and modify LSB
  image.scan(0, 0, width, height, function (x, y, idx) {
    if (messageIndex < binaryMessage.length) {
      for (let i = 0; i < 3; i++) { // R, G, B channels
        if (messageIndex < binaryMessage.length) {
          const bit = parseInt(binaryMessage[messageIndex], 10);
          this.bitmap.data[idx + i] = (this.bitmap.data[idx + i] & ~1) | bit;
          messageIndex++;
        }
      }
    }
  });

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

// LSB Extraction and Decoding
async function decodeMessage(imageBuffer, password) {
  const image = await Jimp.read(imageBuffer);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let binaryMessage = '';
  let delimiterIndex = -1;

  image.scan(0, 0, width, height, function (x, y, idx) {
    if (delimiterIndex === -1) {
      for (let i = 0; i < 3; i++) { // R, G, B channels
        if (delimiterIndex === -1) {
          const bit = this.bitmap.data[idx + i] & 1;
          binaryMessage += bit;

          if (binaryMessage.length >= DELIMITER.length) {
            if (binaryMessage.endsWith(DELIMITER)) {
              delimiterIndex = binaryMessage.length - DELIMITER.length;
            }
          }
        }
      }
    }
  });

  if (delimiterIndex === -1) {
    throw new Error('No hidden message found or delimiter missing');
  }

  const extractedBinary = binaryMessage.substring(0, delimiterIndex);
  let text = binaryToText(extractedBinary);

  if (password) {
    try {
      const bytes = CryptoJS.AES.decrypt(text, password);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) throw new Error("Incorrect password or malformed data");
      text = decryptedText;
    } catch (error) {
      throw new Error("Failed to decrypt message. Ensure password is correct.");
    }
  }

  return text;
}

// Calculate Peak Signal-to-Noise Ratio (PSNR)
async function calculatePSNR(originalBuffer, encodedBuffer) {
  const img1 = await Jimp.read(originalBuffer);
  const img2 = await Jimp.read(encodedBuffer);

  const width = img1.bitmap.width;
  const height = img1.bitmap.height;
  let mse = 0;

  img1.scan(0, 0, width, height, function (x, y, idx) {
    for (let i = 0; i < 3; i++) { // Ignore alpha channel
      const diff = this.bitmap.data[idx + i] - img2.bitmap.data[idx + i];
      mse += diff * diff;
    }
  });

  mse = mse / (width * height * 3);
  if (mse === 0) return Infinity; // Images are identical

  const maxPixelValue = 255;
  const psnr = 20 * Math.log10(maxPixelValue) - 10 * Math.log10(mse);
  return psnr;
}

// Simulate JPEG Compression to check robustness
async function simulateJPEGCompression(imageBuffer, quality = 50) {
  const image = await Jimp.read(imageBuffer);
  image.quality(quality);
  return await image.getBufferAsync(Jimp.MIME_JPEG);
}

module.exports = {
  encodeMessage,
  decodeMessage,
  calculatePSNR,
  simulateJPEGCompression,
};
