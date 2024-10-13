import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { Message } from "venom-bot";
import { z } from "zod";

export async function generateReceipt({
  message,
  businessDescription,
}: {
  message: Message;
  businessDescription: string;
}) {
  const receiptSchema = z.object({
    buyer: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
    productDescription: z.string(),
    purchaseDate: z.string(),
    success: z.boolean(),
    reason: z.string().optional(),
  });

  try {
    const result = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: receiptSchema,
      prompt: message.body,
      system: `
        You are an AI assistant helping a business take its orders.
        
        These are the tasks you are going to do:
        1. Receive messages.
        2. Return a receipt depending on the message contents, with an extra field: success = true or false
            a. If the message does not conform to the expected receipt, the success field should be false
            b. If success = false, put another field, reason, explaining why it failed
            c. Return the receipt in a string object format
    
        You should understand each business receipt models accordingly. 
        The business you are representing is: ${businessDescription}

        Please follow the schema closely.
        `,
    });

    return result.object;
  } catch (err) {
    console.error("generateReceipt:", err);
    return null;
  }
}
