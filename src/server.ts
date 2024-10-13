import express from "express";

import { startWhatsappClient } from "./lib/whatsapp";

const app = express();
const port = process.env.PORT || 3000;

app.get("/connect/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    await startWhatsappClient();

    // You can add any additional setup or logic here

    res
      .status(200)
      .json({ message: `Session ${sessionId} created successfully` });
  } catch (error) {
    console.error(`Error creating session ${sessionId}:`, error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
