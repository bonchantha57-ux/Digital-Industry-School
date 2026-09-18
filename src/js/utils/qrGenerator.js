import QRCode from 'qrcode';

/**
 * Generate a dynamic QR code as Data URL
 */
export async function generateQRCode(text, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    color: {
      dark: '#1E293B',
      light: '#FFFFFF'
    },
    width: 140,
    ...options
  };

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback simple SVG data URI
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="%23eee"/><text x="10" y="60" font-size="12" fill="%23333">QR: ${encodeURIComponent(text)}</text></svg>`;
  }
}
