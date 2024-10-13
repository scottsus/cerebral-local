import { receipts } from "~/schema/receipt";
import { db } from "~/server/db";
import { create, Message } from "venom-bot";

import { generateReceipt } from "./openai";

export async function initClientAndGetQRCode({
  userId,
  businessDescription,
  logQR = false,
}: {
  userId: string;
  businessDescription: string;
  logQR?: boolean
}) {

  let client: any; 

  async function onMessage(message: Message) {
    console.log("Received:", message);

    const generatedReceipt = await generateReceipt({
      message,
      businessDescription,
      client,
    });
    console.log("generatedReceipt:", generatedReceipt);
    if (!generatedReceipt) {``
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
    ).then((createdClient) => {
      console.log("Initializing WhatsApp Venom...");
      client = createdClient; 

      client.onMessage(onMessage);
    });
  });
}
