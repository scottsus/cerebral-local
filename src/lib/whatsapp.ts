import { openai } from "@ai-sdk/openai";
import { receipts } from "~/schema/receipt";
import { db } from "~/server/db";
import { generateObject } from "ai";
import { create, Message } from "venom-bot";
import { z } from "zod";

const BUSINESS_DESCRIPTION = "An online flower shop";
export const BUSINESS_RECEIPT =
  "Buyer's name, product description (name, and qty), date of purchase, address";

export async function startWhatsappClient({ userId }: { userId: string }) {
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

  async function onMessage(message: Message) {
    // Upload db here
    //get push name/phone number
    //check intervie]
    // 1. Check if message is a receipt
    // 2. If possible, add a new row to the DB: https://orm.drizzle.team/docs/data-querying
    // 3. For later: use AI to respond

    console.log("Received whatsapp message");

    const receiptSchema = z.object({
      buyer: z.string(),
      productDescription: z.string(),
      purchase_date: z.string(),
      address: z.string(),
      success: z.boolean(),
      reason: z.string().optional(),
      status: z.string().optional(),
    });

    console.log("Message body: ");
    console.log(message.body);

    const result = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: receiptSchema,
      prompt: message.body,
      system: `You are an AI assistant helping a business taking its orders. These are the tasks you are going to do:
        1. Receive messages.
        2. Return a receipt depending on the message contents:
          a. Add an extra field: success = true or false
          a. If the message does not conform to the expected receipt, the success field should be false
          b. If success = false, put another field, reason, explaining why it failed
          c. Return the receipt in a string object format
          d. If there are multiple items within the same order, strictly normalize the list of items into the following format: 'item name1:qty1, item name2:qty2, ...'
          e. If the message does not appear to be attempting to order something like asking a question or random characters, status = 'invalid', otherwise leave it blank. When messages appear to order something, even if it doesn't make sense with the products that the business you are representing, do not put the status as invalid.
      
        You should understand each business receipt models accordingly. 
        The business you are representing is: ${BUSINESS_DESCRIPTION}
        The receipt of the business you are representing should consist of: ${BUSINESS_RECEIPT}`,
    });

    console.log("Receipt Result: ");
    console.log(result.object);

    if (result.object.success === true) {
      try {
        await db.insert(receipts).values({
          userId,
          buyer: result.object.buyer,
          productDescription: result.object.productDescription,
          purchaseDate: new Date(result.object.purchase_date),
          address: result.object.address,
          phoneNumber: message.sender.id.split("@")[0],
          additionalData: "",
        });
        console.log("Receipt successfully inserted into the database.");
      } catch (error) {
        console.error("Failed to insert receipt into the database:", error);
      }
    } else if (result.object.status != "invalid") {
      try {
        await db.insert(receipts).values({
          userId,
          buyer: result.object.buyer || "Unknown",
          productDescription: result.object.productDescription || "Unknown",
          purchaseDate: new Date(),
          address: result.object.address || "Unknown",
          phoneNumber: message.sender.id.split("@")[0],
          additionalData: result.object.reason || "No reason provided",
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

    console.log("Returning response:");
    return "test response";
  }

  async function _startClient() {
    console.log("WhatsApp bot started...");

    client.onMessage(async (message) => {
      console.log("Received Message:", message);
      onMessage(message);
    });
  }

  _startClient();
}
