import { listenerStatusEnum, users } from "~/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";

export async function updateListenerStatus({
  userId,
  status,
}: {
  userId: string;
  status: (typeof listenerStatusEnum.enumValues)[number];
}) {
  await db
    .update(users)
    .set({ listenerStatus: status })
    .where(eq(users.id, userId));
}
