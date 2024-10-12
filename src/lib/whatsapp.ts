import { create, Whatsapp } from "venom-bot";

async function start(client: Whatsapp) {
  console.log("WhatsApp bot started");

  // Listen for new messages
  client.onMessage(async (message) => {
    console.log("Received a message:", message);

    // Check if the message is an image
    if (message.isMedia || message.isMMS) {
      try {
        // Download media (image)
        const media = await client.downloadMedia(message);

        if (media) {
          console.log("Media downloaded:", media);

          // Optionally, upload the media to cloud storage
          // Example: uploadToCloud(media)

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
  });
}

export function createWhatsAppBot() {
  create({
    session: "test-session",
  })
    .then((client) => start(client))
    .catch((error) => {
      console.error("Error starting bot:", error);
    });
}

