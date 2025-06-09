import { randomUUIDv7 } from "bun";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
export interface SignUpIncomingMessage {
  id: number;
  publickey: string;
  signedMessage: string;
  callbackId: string;
}
export interface SignUpOutgoingMessage {
  validatorId: number;
  callbackId: string;
}
export interface ValidateIncomingMessage {
  publickey: string;
  signedMessage: string;
  callbackId: string;
  latency: number;
  websiteId: number;
  status: "up" | "down" | "unknown" | "unreachable" | "timeout" | "error";
}
export interface ValidateOutgoingMessage {
  url: string;
  validatorId: number;
  callbackId: string;
  websiteId: number;
}
export type IncomingMessage =
  | {
      type: "signUp";
      data: SignUpIncomingMessage;
    }
  | {
      type: "validate";
      data: ValidateIncomingMessage;
    };
export type OutgoingMessage =
  | {
      type: "signUp";
      data: SignUpOutgoingMessage;
    }
  | {
      type: "validate";
      data: ValidateOutgoingMessage;
    };

const CALLBACKS: {
  [callbackId: string]: (data: SignUpOutgoingMessage) => void;
} = {};

let validatorId: number | null = null;

async function main() {
  console.log("Starting validator");
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));
  console.log("Keypair created", keypair);
  const ws = new WebSocket(process.env.HUB_URL!);
  console.log("Connecting to hub");
  ws.onmessage = async (event) => {
    const data: OutgoingMessage = JSON.parse(event.data);
    console.log("Message received", data);
    if (data.type === "signUp") {
      console.log("SignUp received");
      CALLBACKS[data.data.callbackId]?.(data.data);
      delete CALLBACKS[data.data.callbackId];
    } else if (data.type === "validate") {
      await validateHandler(ws, data.data, keypair);
    }
  };

  ws.onopen = async () => {
    const callbackId = randomUUIDv7();
    CALLBACKS[callbackId] = (data: SignUpOutgoingMessage) => {
      validatorId = data.validatorId;
    };
    const signedMessage = await signMessage(
      `Signed Message for SignUp,${callbackId} ${keypair.publicKey}`,
      keypair
    );

    ws.send(
      JSON.stringify({
        type: "signUp",
        data: {
          callbackId,

          publickey: keypair.publicKey,
          signedMessage,
        },
      })
    );
  };
}

async function validateHandler(
  ws: WebSocket,
  { url, callbackId, validatorId, websiteId }: ValidateOutgoingMessage,
  keypair: Keypair
) {
  console.log(`Validating ${url}`);
  const startTime = Date.now();
  const signature = await signMessage(`Replying to ${callbackId}`, keypair);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const endTime = Date.now();
    const latency = endTime - startTime;
    const status = response.status;

    let statusType: "up" | "down" | "unknown" = "unknown";
    if (status >= 200 && status < 400) {
      statusType = "up";
    } else {
      statusType = "down";
    }

    ws.send(
      JSON.stringify({
        type: "validate",
        data: {
          callbackId,
          status: statusType,
          latency,
          websiteId,
          validatorId,
          signedMessage: signature,
        },
      })
    );
  } catch (error: any) {
    const endTime = Date.now();
    const latency = endTime - startTime;

    let statusType: "timeout" | "unreachable" | "error" | "unknown" = "error";

    if (error.name === "AbortError") {
      statusType = "timeout";
    } else if (
      error.code === "ENOTFOUND" || // DNS issue
      error.code === "ECONNREFUSED" || // Connection refused
      error.code === "EHOSTUNREACH"
    ) {
      statusType = "unreachable";
    }

    ws.send(
      JSON.stringify({
        type: "validate",
        data: {
          callbackId,
          status: statusType,
          latency,
          websiteId,
          validatorId,
          signedMessage: signature,
        },
      })
    );
    console.error(`Validation error for ${url}:`, error.message);
  }
}

async function signMessage(message: string, keypair: Keypair) {
  const messageBytes = nacl_util.decodeUTF8(message);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

  return JSON.stringify(Array.from(signature));
}

main();
