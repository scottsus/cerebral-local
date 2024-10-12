import { create, Message } from "venom-bot";
import { streamText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const BUSINESS_DESCRIPTION = "An online flower shop"
const BUSINESS_RECEIPT = "Buyer's name, product description (name, and qty), date of purchase, address"

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

  async function onMessage(message: Message) {
    // Upload db here
    //get push name/phone number
    // 1. Check if message is a receipt
    // 2. If possible, add a new row to the DB: https://orm.drizzle.team/docs/data-querying
    // 3. For later: use AI to respond

    

    console.log("Received whatsapp message")

    const receiptSchema = z.object({
      buyer: z.string(),
      productDescription: z.string(),
      purchase_date: z.string(),
      address: z.string(),
      // createdAt: z.string(),
      // updatedAt: z.string(),
      success: z.boolean(),
      reason: z.string().optional()
    });

    console.log("Message body: ")
    console.log(message.body)
  
    const result = await generateObject({
      model: openai('gpt-4-turbo'),
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

    console.log("Receipt Result: ")
    console.log(result.object)

    // return result.toAIStreamResponse()
    
  }

  async function _startClient() {
    console.log("WhatsApp bot started...");

    client.onMessage(async (message) => {
      console.log("Received Message:", message);

      // sampleOnMessage(message);
      onMessage(message);
    });
  }

  _startClient();
}
