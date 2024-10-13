import express from "express";

import { initClientAndGetQRCode } from "./lib/whatsapp-v2";

const app = express();
const port = process.env.PORT || 4269;

app.get("/connect/:userId", async (req, res) => {
  // This must correspond with the userId in the DB
  const { userId } = req.params;

  try {
    // TODO: Grab the actual business
    const businessDescription = "You are a small business.";
    const qrCode = await initClientAndGetQRCode({
      userId,
      businessDescription,
    });

    res.status(200).json({ userId, qrCode });
  } catch (error) {
    console.error(`/connect/:userId: [${userId}]:`, error);

    res.status(500).json({ error: `Error creating session for ${userId}.` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
