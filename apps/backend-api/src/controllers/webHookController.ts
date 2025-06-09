import { Request, Response } from "express";
import { Webhook } from "svix";
import { db } from "../../../../packages/database/src";
import { userTable } from "../../../../packages/database/src/models/user";
import { tryCatch } from "../utils/tryCatch";
export async function userWebhook(req: Request, res: Response) {
  console.log("webhook called");
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.warn(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env"
    );
    return void res.json({
      success: false,
      message: "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env",
    });
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headers = req.headers;
  const payload = req.body;

  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return void res.status(400).json({
      success: false,
      message: "Error: Missing svix headers",
    });
  }

  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    });
  } catch (err: any) {
    console.warn("Error: Could not verify webhook:", err.message);
    return void res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

  const { data, error } = await tryCatch(
    db
      .insert(userTable)
      .values({
        id: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        image: evt.data.image_url,
      })
      .returning()
  );
  if (error) {
    return void res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  console.log("User data inserted:", data[0]?.id);
  return void res.status(200).json({
    success: true,
    message: "Webhook received",
  });
}
