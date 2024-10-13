import { receipts } from "~/schema/receipt";
import { db } from "~/server/db";
import { create, Message, Whatsapp } from "venom-bot";

import { updateListenerStatus } from "./db";
import { generateReceipt } from "./openai";

let client: Whatsapp | null;

export async function initClientAndGetQRCode({
  userId,
  businessDescription,
  logQR = false,
}: {
  userId: string;
  businessDescription: string;
  logQR?: boolean;
}) {
  if (client) {
    await client.close();
    client = null;
  }

  async function onMessage(message: Message) {
    console.log("Received:", message);

    const generatedReceipt = await generateReceipt({
      message,
      businessDescription,
      client,
    });
    console.log("generatedReceipt:", generatedReceipt);
    if (!generatedReceipt) {
      ``;
      return;
    }

    try {
      const senderPhone = message.sender.id.split("@")[0];

      if (generatedReceipt.success) {
        await db.insert(receipts).values({
          userId,
          buyer: generatedReceipt.buyer,
          phoneNumber: senderPhone,
          address: generatedReceipt.address,
          purchaseDate: new Date(generatedReceipt.purchaseDate),
          productDescription: generatedReceipt.productDescription,
          additionalData: "",
        });
      } else {
        // Best effort status logging
        await db.insert(receipts).values({
          userId,
          buyer: generatedReceipt.buyer ?? "-",
          phoneNumber: senderPhone,
          address: generatedReceipt.address ?? "-",
          purchaseDate: new Date(),
          productDescription: generatedReceipt.productDescription ?? "-",
          status: "FLAGGED",
          additionalData:
            generatedReceipt.reason ?? "Unknown reason for failure",
        });
      }
    } catch (err) {
      console.error("onMessage:", err);
    }
  }

  return new Promise((res) => {
    updateListenerStatus({ userId, status: "INITIALIZING" })
      .then(() =>
        create(
          userId,
          (base64QRCode) => {
            res(base64QRCode);
          },
          (statusSession) => {
            if (statusSession === "isLogged") {
              res("Already logged in");
            }
          },
          { logQR },
        ),
      )
      .then((createdClient) => {
        updateListenerStatus({ userId, status: "RUNNING" });
        client = createdClient;
      })
      .then(() => {
        console.log("Initializing WhatsApp Venom...");

        client!.onMessage(onMessage);
      });
  });
}
