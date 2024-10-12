import { create, Message } from "venom-bot";

export async function startWhatsappClient() {
  const sessionName = new Date().toISOString().replace(/[:.]/g, "-");
  const client = await create({
    session: `session-${sessionName}`,
  });

  async function sampleOnMessage(message: Message) {
    if (message.isMedia || message.isMMS) {
      try {
        // Download media (image)
        const media = await client.downloadMedia(message);

        if (media) {
          console.log("Media downloaded:", media);

          // Respond back to the user
          await client.sendText(
            message.from,
            "Your receipt has been received and processed.",
          );
        }
      } catch (error) {
        console.error("Error downloading media:", error);
      }
    } else {
      // Handle non-media messages (e.g., text messages)
      await client.sendText(message.from, "Please send a receipt image.");
    }
  }

  async function onMessage() {
    // 1. Check if message is a receipt
    // 2. If possible, add a new row to the DB: https://orm.drizzle.team/docs/data-querying
    // 3. For later: use AI to respond
  }

  async function _startClient() {
    console.log("WhatsApp bot started...");

    client.onMessage(async (message) => {
      console.log("Received Message:", message);

      sampleOnMessage(message);
    });
  }

  _startClient();
}
