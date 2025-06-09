import { and, eq, getTableColumns } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../../../../packages/database/src";
import {
  WebsiteInsert,
  websiteTable,
} from "../../../../packages/database/src/models/website";
import { websiteTicksTable } from "../../../../packages/database/src/models/websiteTicks";
import { tryCatch } from "../utils/tryCatch";
export async function createWebsiteController(req: Request, res: Response) {
  console.log("create website controller called", req.body);
  const { title, url, description } = req.body as WebsiteInsert;
  const userId = req.userId;

  const { data, error } = await tryCatch(
    db
      .insert(websiteTable)
      .values({
        title,
        url,
        description,
        userId,
      })
      .returning()
  );
  if (error) {
    console.error("Error creating website:", error);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
  if (!data || data.length === 0) {
    return void res
      .status(400)
      .json({ success: false, message: "No data returned" });
  }
  console.log("Website created successfully:", data[0]);
  return void res.status(201).json({ success: true, data: data[0] });
}
export async function deleteWebsiteController(req: Request, res: Response) {
  console.log("delete website controller called");
  const { id } = req.params;
  const userId = req.userId;
  const { data, error } = await tryCatch(
    db
      .update(websiteTable)
      .set({ disabled: true })
      .where(
        and(eq(websiteTable.id, Number(id)), eq(websiteTable.userId, userId))
      )
      .returning()
  );
  if (error) {
    console.error("Error deleting website:", error);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
  if (!data || data.length === 0) {
    return void res
      .status(400)
      .json({ success: false, message: "No data returned" });
  }
  console.log("Website deleted successfully:", data[0]);
  return void res.status(200).json({ success: true, data: data[0] });
}
export async function getAllWebsitesController(req: Request, res: Response) {
  console.log("get all websites controller called");
  const userId = req.userId;
  const { data, error } = await tryCatch(
    db
      .select({
        id: websiteTable.id,
        title: websiteTable.title,
        url: websiteTable.url,
        description: websiteTable.description,
        createdAt: websiteTable.createdAt,
        updatedAt: websiteTable.updatedAt,
        status: websiteTicksTable.status,
        latency: websiteTicksTable.latency,
        updateFrom: websiteTicksTable.updatedFromLocation,
      })
      .from(websiteTable)
      .leftJoin(
        websiteTicksTable,
        eq(websiteTicksTable.websiteId, websiteTable.id)
      )
      .where(
        and(eq(websiteTable.userId, userId), eq(websiteTable.disabled, false))
      )
  );

  if (error) {
    console.error("Error fetching websites:", error);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
  if (!data) {
    return void res
      .status(404)
      .json({ success: false, message: "No websites found" });
  }

  return void res.status(200).json({ success: true, data });
}
export async function getWebsiteByIdController(req: Request, res: Response) {
  console.log("get website by id controller called");
  const { id } = req.params;
  const userId = req.userId;

  const { data, error } = await tryCatch(
    db
      .select({
        ...getTableColumns(websiteTable),
        ...getTableColumns(websiteTicksTable),
      })
      .from(websiteTable)
      .leftJoin(
        websiteTicksTable,
        eq(websiteTicksTable.websiteId, websiteTable.id)
      )
      .where(
        and(
          eq(websiteTable.id, Number(id)),
          eq(websiteTable.userId, userId),
          eq(websiteTable.disabled, false)
        )
      )
  );

  if (error) {
    console.error("Error fetching website:", error);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
  if (!data || data.length === 0) {
    return void res
      .status(404)
      .json({ success: false, message: "Website not found" });
  }

  return void res.status(200).json({ success: true, data: data[0] });
}
