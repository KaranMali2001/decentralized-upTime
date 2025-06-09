import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

export async function verifyMessage(
  message: string,
  publickey: string,
  signature: Uint8Array
) {
  console.log("Verifying message", message, publickey, signature);
  try {
    const msgByte = nacl_util.decodeUTF8(message);
    const res = nacl.sign.detached.verify(
      msgByte,
      signature,
      new PublicKey(publickey).toBytes()
    );
    return res;
  } catch (error) {
    console.error("Error verifying message:", error);
    return false;
  }
}
