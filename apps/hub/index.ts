import { PublicKey } from "@solana/web3.js";
import { randomUUIDv7, type ServerWebSocket } from "bun";

import dotenv from "dotenv";
import { eq, sql } from "drizzle-orm";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import { db } from "../../packages/database/src";
import { validatorTable } from "../../packages/database/src/models/validators";
import { websiteTable } from "../../packages/database/src/models/website";
import { websiteTicksTable } from "../../packages/database/src/models/websiteTicks";
dotenv.config();
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
  validatorId: string;
}

export interface ValidateOutgoingMessage {
  url: string;
  validatorId: number;
  callbackId: string;
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

type IpApiResponse = {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
};

const availableValidators: {
  validatorId: number;
  socket: ServerWebSocket<unknown>;
  publickey: string;
}[] = [];

const CALLBACKS: {
  [callbackId: string]: (data: IncomingMessage) => void;
} = {};

const COST_PER_VALIDATOR = 1000; //lamports

Bun.serve({
  fetch(req, server) {
    if (
      server.upgrade(req, {
        data: { ip: server.requestIP(req) },
      })
    ) {
      return;
    }
    return new Response("upgrade failed", { status: 400 });
  },
  port: 8000,
  websocket: {
    async message(ws: ServerWebSocket<unknown>, message: string) {
      const data = JSON.parse(message) as IncomingMessage;
      if (data.type === "signUp") {
        const verified = await verifyMessage(
          `Signed Message for SignUp,${data.data.callbackId} ${data.data.publickey}`,
          data.data.publickey,
          data.data.signedMessage
        );
        console.log("Verified", verified);
        if (verified) {
          //@ts-ignore
          await signUpHandler(ws, data.data, ws.data.ip.address);
        }
      } else if (data.type === "validate") {
        if (CALLBACKS[data.data.callbackId]) {
          //@ts-ignore
          CALLBACKS[data.data.callbackId](data);
          delete CALLBACKS[data.data.callbackId];
        }
      }
    },
    async close(ws: ServerWebSocket<unknown>) {
      availableValidators.splice(
        availableValidators.findIndex((v) => v.socket === ws),
        1
      );
    },
  },
});

async function verifyMessage(
  message: string,
  publickey: string,
  signature: string
) {
  console.log("Verifying message", message, publickey, signature);
  const msgByte = nacl_util.decodeUTF8(message);
  const res = nacl.sign.detached.verify(
    msgByte,
    new Uint8Array(JSON.parse(signature)),
    new PublicKey(publickey).toBytes()
  );
  return res;
}

async function signUpHandler(
  ws: ServerWebSocket<unknown>,
  { publickey, callbackId }: SignUpIncomingMessage,
  ip: string
) {
  //fetch the location from Ip
  const res = await fetch(`https://ipapi.co/${ip}/json/`, {
    headers: {
      "User-Agent": "nodejs-ipapi-v1.02",
    },
  });

  let location = (await res.json()) as IpApiResponse;
  if (location.ip.startsWith("::ffff:127.")) {
    location.ip = location.ip.replace("::ffff:127.0.0.1", "127.0.0.1");
  }
  console.log("Location", location);
  const validator = await db
    .update(validatorTable)
    .set({
      ipAddress: ip,
      location: location.ip.startsWith("127.0.0.1")
        ? "localhost"
        : location.region,
    })
    .where(eq(validatorTable.publicKey, publickey))
    .returning();
  console.log("Validator found", validator);

  if (validator[0]) {
    ws.send(
      JSON.stringify({
        type: "signup",
        data: {
          validatorId: validator[0].id,
          callbackId,
        },
      })
    );
    availableValidators.push({
      validatorId: validator[0].id,
      socket: ws,
      publickey: validator[0].publicKey,
    });
    console.log("finally", availableValidators);
    return;
  }

  const newValidator = await db
    .insert(validatorTable)
    .values({
      ipAddress: ip,
      publicKey: publickey,
      location: location.ip.startsWith("127.0.0.1")
        ? "localhost"
        : location.region,
      pendingPayOuts: 0,
      chain: "sol",
    })
    .returning();
  if (newValidator[0]) {
    ws.send(
      JSON.stringify({
        type: "signup",
        data: {
          validatorId: newValidator[0].id,
          callbackId,
        },
      })
    );

    availableValidators.push({
      validatorId: newValidator[0].id,
      socket: ws,
      publickey: newValidator[0].publicKey,
    });
    console.log("finally", availableValidators);
  }
}

setInterval(async () => {
  console.log("started");
  const websitesToMonitor = await db
    .select()
    .from(websiteTable)
    .where(eq(websiteTable.disabled, false));
  console.log("websites", websitesToMonitor);
  for (const website of websitesToMonitor) {
    availableValidators.forEach((validator) => {
      const callbackId = randomUUIDv7();
      console.log(
        `Sending validate to ${validator.validatorId} ${website.url}`
      );
      validator.socket.send(
        JSON.stringify({
          type: "validate",
          data: {
            url: website.url,
            callbackId,
          },
        })
      );

      CALLBACKS[callbackId] = async (data: IncomingMessage) => {
        if (data.type === "validate") {
          const { validatorId, status, latency, signedMessage } = data.data;
          const verified = await verifyMessage(
            `Replying to ${callbackId}`,
            validator.publickey,
            signedMessage
          );
          if (!verified) {
            return;
          }
          const currentValidator = await db
            .select()
            .from(validatorTable)
            .where(eq(validatorTable.id, validator.validatorId));

          // Fix: Check if validator exists before accessing
          if (!currentValidator[0]) {
            return;
          }

          await db.transaction(async (tx) => {
            // Fix: Include validatorId and use correct field names
            await tx.insert(websiteTicksTable).values({
              validatorId: validator.validatorId, // Add missing validatorId
              websiteId: website.id,
              latency: latency,
              status: status,
              updatedFromLocation: currentValidator[0]!.location,
            });

            await tx
              .update(validatorTable)
              .set({
                pendingPayOuts: sql`${validatorTable.pendingPayOuts} + ${COST_PER_VALIDATOR}`,
              })
              .where(eq(validatorTable.publicKey, validator.publickey));
          });
        }
      };
    });
  }
}, 30000);
