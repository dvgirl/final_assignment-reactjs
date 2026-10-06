const QRCode = require('qrcode');

/**
 * Generate a high quality QR code data URL from a string / JSON payload
 * @param {Object|string} data - Pass code or JSON object
 * @returns {Promise<string>} Base64 Data URL
 */
const generateQRCodeDataURL = async (data) => {
  try {
    const textData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const qrDataURL = await QRCode.toDataURL(textData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Generate a unique Pass Code (e.g. VP-2026-98124)
 */
const generatePassCode = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `VP-${year}-${randomNum}`;
};

module.exports = {
  generateQRCodeDataURL,
  generatePassCode,
};
