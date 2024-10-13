import { initClientAndGetQRCode } from "./lib/whatsapp-v2";

async function main() {
  const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const businessDescription = "You are a small flower shop business.";
  const qrCode = await initClientAndGetQRCode({
    userId,
    businessDescription,
    logQR: true,
  });
}

main();
