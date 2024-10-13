import { openai } from "@ai-sdk/openai";
import { receipts } from "~/schema/receipt";
import { db } from "~/server/db";
import { generateObject } from "ai";
import { create, Message } from "venom-bot";
import { z } from "zod";

const BUSINESS_DESCRIPTION = "An online flower shop";
const BUSINESS_RECEIPT =
  "Buyer's name, product description (name, and qty), date of purchase, address";

export async function createClientAndGetQRCode(sessionId: string) {
  async function onMessage(message: Message) {
    const receiptSchema = z.object({
      buyer: z.string(),
      productDescription: z.string(),
      purchase_date: z.string(),
      address: z.string(),
      success: z.boolean(),
      reason: z.string().optional(),
    });

    const result = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: receiptSchema,
      prompt: message.body,
      system: `You are an AI assistant helping a business taking its orders. These are the tasks you are going to do:
        1. Receive messages.
        2. Return a receipt depending on the message contents, with an extra field: success = true or false
          a. If the message does not conform to the expected receipt, the success field should be false
          b. If success = false, put another field, reason, explaining why it failed
          c. Return the receipt in a string object format
      
        You should understand each business receipt models accordingly. 
        The business you are representing is: ${BUSINESS_DESCRIPTION}
        The receipt of the business you are representing should consist of: ${BUSINESS_RECEIPT}`,
    });

    if (result.object.success === true) {
      try {
        await db.insert(receipts).values({
          buyer: result.object.buyer,
          productDescription: result.object.productDescription,
          purchase_date: new Date(result.object.purchase_date),
          address: result.object.address,
          phone_num: "",
          flagged: false,
          additional_data: "",
        });

        console.log("Receipt successfully inserted into the database.");
      } catch (error) {
        console.error("Failed to insert receipt into the database:", error);
      }
    } else {
      try {
        await db.insert(receipts).values({
          buyer: result.object.buyer || "Unknown",
          productDescription: result.object.productDescription || "Unknown",
          purchase_date: new Date(),
          address: result.object.address || "Unknown",
          phone_num: "",
          flagged: true,
          additional_data: result.object.reason || "No reason provided",
        });
        console.log(
          "Receipt flagged and inserted into the database with additional data.",
        );
      } catch (error) {
        console.error(
          "Failed to insert flagged receipt into the database:",
          error,
        );
      }
    }
  }

  return new Promise((res) => {
    create(
      sessionId,
      (base64QRCode) => {
        res(base64QRCode);
      },
      (statusSession) => {
        if (statusSession === "isLogged") {
          res("Already logged in");
        }
      },
      { logQR: false },
    ).then((client) => {
      console.log("Initializing WhatsApp Venom...");

      client.onMessage(async (message) => {
        console.log("Received:", message);

        onMessage(message);
      });
    });
  });
}
