import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { Message } from "venom-bot";
import { z } from "zod";
import { BUSINESS_RECEIPT } from "./whatsapp";
import { Client } from "pg";

export async function generateReceipt({
  message,
  businessDescription,
  client
}: {
  message: Message;
  businessDescription: string;
  client: any;
}) {
  const receiptSchema = z.object({
    buyer: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
    productDescription: z.string(),
    purchaseDate: z.string(),
    success: z.boolean(),
    reason: z.string().optional(),
    response: z.string().optional(),
    shouldResponse: z.boolean()
  });

  try {
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
          e. If the message does not appear to be attempting to order something like asking a question or random characters, shouldResponse = True, otherwise False. When messages appear to order something, even if it doesn't make sense with the products that the business you are representing, do not put the status as invalid.
          f. If shouldResponse = true, response field should be your response as the acting representative of the business.

        You should understand each business receipt models accordingly. 
        The business you are representing is: ${businessDescription}
        The receipt of the business you are representing should consist of: ${BUSINESS_RECEIPT}`,
    });

    const generatedReceipt = result.object;

    // Check if a response should be sent based on shouldResponse
    if (generatedReceipt.shouldResponse && generatedReceipt.response) {
      try {
        // Send the response back to the user
        await client.sendText(message.from, generatedReceipt.response);
        console.log("Response sent to user:", generatedReceipt.response);
      } catch (err) {
        console.error("Failed to send response to user:", err);
      }
    }

    return result.object;
  } catch (err) {
    console.error("generateReceipt:", err);
    return null;
  }
}
