// src/utils/pdfFonts.js

let cachedFonts = null;

export async function loadArabicFonts() {
  // Return cached fonts if already loaded
  if (cachedFonts) return cachedFonts;

  const [regularResponse, boldResponse] = await Promise.all([
    fetch("/fonts/Amiri-Regular.ttf"),
    fetch("/fonts/Amiri-Bold.ttf"),
  ]);

  const [regularBuffer, boldBuffer] = await Promise.all([
    regularResponse.arrayBuffer(),
    boldResponse.arrayBuffer(),
  ]);

  // Convert ArrayBuffer → Base64
  const toBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  cachedFonts = {
    regular: toBase64(regularBuffer),
    bold: toBase64(boldBuffer),
  };

  return cachedFonts;
}
