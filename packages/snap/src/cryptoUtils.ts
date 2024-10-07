import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Network,
  Secp256k1PrivateKey,
} from '@aptos-labs/ts-sdk';
import { SLIP10Node } from '@metamask/key-tree';
import nacl from 'tweetnacl';

import { assertInput, assertIsArray, bytesToHex } from './utils';

function isValidSegment(segment) {
  if (typeof segment !== 'string') {
    return false;
  }

  if (!segment.match(/^[0-9]+'$/)) {
    return false;
  }

  const index = segment.slice(0, -1);

  if (parseInt(index).toString() !== index) {
    return false;
  }

  return true;
}

export async function deriveKeyPair(path) {
  assertIsArray(path);
  assertInput(path.length);
  assertInput(path.every((segment) => isValidSegment(segment)));

  const rootNode = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path: [`m`, `44'`, `637'`],
      curve: 'secp256k1',
    },
  });

  const node = await SLIP10Node.fromJSON(rootNode);

  const keypair = await node.derive(path.map((segment) => `slip10:${segment}`));

  // const privateKeyBytes = keypair.privateKeyBytes.slice(0, 32);

  return keypair.privateKeyBytes;
  // return privateKeyBytes;
  // return nacl.sign.keyPair.fromSeed(Uint8Array.from(keypair.privateKeyBytes));
}

/**
 *
 */
export async function getAccount(path: string): Promise<Account> {
  // const { publicKey, secretKey } = await deriveKeyPair(path);
  const privateKeyBytes = await deriveKeyPair(path);

  // to derive an account with a Single Sender Secp256k1 key scheme
  const privateKey = new Secp256k1PrivateKey(Uint8Array.from(privateKeyBytes));
  // const privateKey = new Secp256k1PrivateKey(secretKey);
  const account = Account.fromPrivateKey({ privateKey });
  return account as Account;
}
export async function getPublicKey(path: string): Promise<string> {
  const privateKeyBytes = await deriveKeyPair(path);

  const privateKey = new Secp256k1PrivateKey(Uint8Array.from(privateKeyBytes));
  const account = Account.fromPrivateKey({ privateKey });

  const byteArray = Object.values(account.accountAddress.data);
  const hex = bytesToHex(byteArray).toString();

  return hex as string;
}
