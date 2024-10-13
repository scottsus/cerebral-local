import { startWhatsappClient } from "~/lib/whatsapp";
import { initClientAndGetQRCode } from "./lib/whatsapp-v2";

async function main() {
  // startWhatsappClient({userId: "12345"});


  try {
    // TODO: Grab the actual business
    const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    const businessDescription = "You are a small flower shop business.";
    const qrCode = await initClientAndGetQRCode({
      userId,
      businessDescription,
      logQR: true
    });

    
  } catch (error) {
    // console.error(`/connect/:userId: [${userId}]:`, error);

    // res.status(500).json({ error: `Error creating session for ${userId}.` });
  }
}

main();
