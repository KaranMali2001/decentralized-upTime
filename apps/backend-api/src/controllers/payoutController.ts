import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { randomBytes } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../../../../packages/database/src";
import { txnTable } from "../../../../packages/database/src/models/txn";
import { validatorTable } from "../../../../packages/database/src/models/validators";
import { tryCatch } from "../utils/tryCatch";
import { verifyMessage } from "../utils/verifyMessage";

export async function getPayOutBalanceController(req: Request, res: Response) {
  console.log("get pay out balance controller called");
  const { publicKey } = req.params;
  if (!publicKey) {
    return void res
      .status(400)
      .json({ success: false, message: "No public key provided" });
  }
  const { data, error } = await tryCatch(
    db
      .select({
        balence: validatorTable.pendingPayOuts,
      })
      .from(validatorTable)
      .where(eq(validatorTable.publicKey, publicKey))
  );
  if (error) {
    console.error("Error fetching pay out balance:", error);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
  if (!data || data.length === 0) {
    return void res
      .status(404)
      .json({ success: false, message: "Pay out not found" });
  }

  return void res.status(200).json({ success: true, data: data[0] });
}
export async function withDrawPayOutController(req: Request, res: Response) {
  console.log("process pay out controller called");
  const { publicKey, amount, signedMessage, signature } = req.body;

  // Validation
  if (!publicKey) {
    return void res
      .status(400)
      .json({ success: false, message: "No public key provided" });
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return void res
      .status(400)
      .json({ success: false, message: "Invalid amount provided" });
  }

  if (!signedMessage || !signature) {
    return void res.status(400).json({
      success: false,
      message: "No signed message or signature provided",
    });
  }

  try {
    new PublicKey(publicKey);
  } catch (error) {
    return void res
      .status(400)
      .json({ success: false, message: "Invalid public key format" });
  }

  // Fetch validator data
  const { data, error } = await tryCatch(
    db
      .select()
      .from(validatorTable)
      .where(and(eq(validatorTable.publicKey, publicKey)))
  );

  if (error) {
    console.error("Error fetching validator:", error);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

  if (!data || data.length === 0 || !data[0]) {
    console.error("Validator not found");
    return void res
      .status(404)
      .json({ success: false, message: "Validator not found" });
  }
  if (data[0].isProcessing) {
    console.error("Validator is processing");
    return void res
      .status(400)
      .json({ success: false, message: "Validator is processing" });
  }
  const validator = data[0];

  // Verify the signed message
  if (!validator.tempSignedMessage || !validator.signedMessageExpiry) {
    console.error("No pending message to verify");
    return void res
      .status(400)
      .json({ success: false, message: "No pending message to verify" });
  }

  // Check if message has expired
  if (new Date() > validator.signedMessageExpiry) {
    console.error("Signed message has expired");
    return void res
      .status(400)
      .json({ success: false, message: "Signed message has expired" });
  }

  // Verify that the provided message matches the stored one
  if (signedMessage !== validator.tempSignedMessage) {
    return void res
      .status(400)
      .json({ success: false, message: "Message mismatch" });
  }

  console.log("verifying signature", signedMessage, publicKey, signature.data);
  if (!verifyMessage(signedMessage, publicKey, signature.data)) {
    return void res
      .status(401)
      .json({ success: false, message: "Invalid signature" });
  }

  // Check sufficient funds
  if (validator.pendingPayOuts < Number(amount)) {
    return void res
      .status(400)
      .json({ success: false, message: "Insufficient funds" });
  }

  // Set processing flag to prevent concurrent operations
  const { error: processingError } = await tryCatch(
    db
      .update(validatorTable)
      .set({
        isProcessing: true,
        tempSignedMessage: null, // Clear the used message
        signedMessageExpiry: null,
      })
      .where(eq(validatorTable.publicKey, publicKey))
  );

  if (processingError) {
    console.error("Error setting processing flag:", processingError);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

  // Update pending payouts
  const { data: updatedData, error: updatedError } = await tryCatch(
    db
      .update(validatorTable)
      .set({
        pendingPayOuts: sql`${validatorTable.pendingPayOuts} - ${amount}`,
      })
      .where(eq(validatorTable.publicKey, publicKey))
      .returning()
  );

  if (updatedError || !updatedData || updatedData.length === 0) {
    console.error("Error updating pay out:", updatedError);
    // Reset processing flag
    await tryCatch(
      db
        .update(validatorTable)
        .set({ isProcessing: false })
        .where(eq(validatorTable.publicKey, publicKey))
    );
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

  const keyPair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY!))
  );

  try {
    const connection = new Connection(
      process.env.SOLANA_URL || "https://api.devnet.solana.com"
    );

    const txn = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keyPair.publicKey,
        toPubkey: new PublicKey(publicKey),
        lamports: Number(amount),
      })
    );

    const sign = await sendAndConfirmTransaction(connection, txn, [keyPair], {
      commitment: "confirmed",
      maxRetries: 3,
    });

    console.log(`Transaction successful with signature: ${sign}`);

    // Transaction successful - create transaction record and finalize
    const { error: txnCreateError } = await tryCatch(
      db.transaction(async (tx) => {
        await tx.insert(txnTable).values({
          fromPub: keyPair.publicKey.toBase58(),
          toPub: publicKey,
          txnSignature: sign,
          amount: Number(amount),
          validatorId: validator.id,
        });

        await tx
          .update(validatorTable)
          .set({
            isProcessing: false,
          })
          .where(eq(validatorTable.publicKey, publicKey));
      })
    );

    if (txnCreateError) {
      console.error("Error creating transaction record:", txnCreateError);
      return void res.status(500).json({
        success: false,
        message: "Transaction successful but record creation failed",
        transactionSignature: sign,
        requiresManualReconciliation: true,
      });
    }

    return void res.status(200).json({
      success: true,
      data: updatedData[0],
      transactionSignature: sign,
      message: "Payout processed successfully",
    });
  } catch (blockchainError) {
    console.error("Blockchain transaction failed:", blockchainError);

    // ROLLBACK: Restore pending payouts and reset processing flag
    const { error: rollbackError } = await tryCatch(
      db
        .update(validatorTable)
        .set({
          pendingPayOuts: sql`${validatorTable.pendingPayOuts} + ${amount}`,
          isProcessing: false,
        })
        .where(eq(validatorTable.publicKey, publicKey))
    );

    if (rollbackError) {
      console.error(
        "CRITICAL: Rollback failed after blockchain transaction failure:",
        rollbackError
      );
      return void res.status(500).json({
        success: false,
        message:
          "Transaction failed and rollback failed - requires manual intervention",
        criticalError: true,
        publicKey: publicKey,
        amount: amount,
      });
    }

    return void res.status(500).json({
      success: false,
      message: "Blockchain transaction failed",
      error:
        blockchainError instanceof Error
          ? blockchainError.message
          : "Unknown blockchain error",
    });
  }
}
export async function getMessageController(req: Request, res: Response) {
  console.log("get message controller called");
  const { publicKey } = req.params;

  if (!publicKey) {
    return void res
      .status(400)
      .json({ success: false, message: "No public key provided" });
  }

  try {
    // Validate public key format
    new PublicKey(publicKey);
  } catch (error) {
    return void res
      .status(400)
      .json({ success: false, message: "Invalid public key format" });
  }

  // Check if validator exists
  const { data: validatorData, error: validatorError } = await tryCatch(
    db
      .select()
      .from(validatorTable)
      .where(eq(validatorTable.publicKey, publicKey))
  );

  if (validatorError) {
    console.error("Error fetching validator:", validatorError);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

  if (!validatorData || validatorData.length === 0) {
    return void res
      .status(404)
      .json({ success: false, message: "Validator not found" });
  }

  // Generate a unique message for signing
  const timestamp = Date.now();
  const nonce = randomBytes(16).toString("hex");
  const message = `Withdraw request for ${publicKey} at ${timestamp} with nonce ${nonce}`;

  // Store the message temporarily (with expiration)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  const { error: updateError } = await tryCatch(
    db
      .update(validatorTable)
      .set({
        tempSignedMessage: message,
        signedMessageExpiry: expiresAt,
      })
      .where(eq(validatorTable.publicKey, publicKey))
  );

  if (updateError) {
    console.error("Error updating temp message:", updateError);
    return void res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

  return void res.status(200).json({
    success: true,
    message: message,
    expiresAt: expiresAt.toISOString(),
  });
}
