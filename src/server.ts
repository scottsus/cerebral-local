import express from "express";

import { createClientAndGetQRCode } from "./lib/whatsapp-v2";

const app = express();
const port = process.env.PORT || 3000;

app.get("/connect/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const qrCode = await createClientAndGetQRCode(sessionId);

    res.status(200).json({ sessionId, qrCode });
  } catch (error) {
    console.error(`Error creating session ${sessionId}:`, error);

    res.status(500).json({ error: "Failed to create session" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
