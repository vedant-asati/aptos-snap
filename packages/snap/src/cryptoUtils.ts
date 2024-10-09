import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Network,
  Secp256k1PrivateKey,
} from '@aptos-labs/ts-sdk';
import { SLIP10Node, SLIP10PathTuple } from '@metamask/key-tree';
import nacl from 'tweetnacl';

import {
  assertInput,
  assertIsArray,
  bytesToHex,
  isValidSegment,
} from './utils';

export async function getRawPrivateKey(
  path: string[],
): Promise<Uint8Array | undefined> {
  assertIsArray(path);
  assertInput(path.length);
  assertInput(path.every((segment: any) => isValidSegment(segment)));

  const rootNode = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path: [`m`, `44'`, `637'`],
      curve: 'secp256k1',
    },
  });

  const node = await SLIP10Node.fromJSON(rootNode);
  const keypair = await node.derive(
    path.map((segment: any) => `slip10:${segment}`) as SLIP10PathTuple,
  );

  return keypair.privateKeyBytes;
}

export async function getPrivateKey(path: string[]): Promise<string> {
  const privateKeyBytes = (await getRawPrivateKey(path)) as Uint8Array;
  const privateKey = new Secp256k1PrivateKey(privateKeyBytes);
  return privateKey.toString();
}

export async function getAccount(path: string[]): Promise<Account> {
  const privateKeyBytes = (await getRawPrivateKey(path)) as Uint8Array;

  // to derive an account with a Single Sender Secp256k1 key scheme
  const privateKey = new Secp256k1PrivateKey(privateKeyBytes);
  const account = Account.fromPrivateKey({ privateKey });
  return account as Account;
}

export async function getAccountAddress(path: string[]): Promise<string> {
  const account = await getAccount(path);
  return account.accountAddress.toString();
}

export async function getPublicKey(path: string[]): Promise<string> {
  const account = await getAccount(path);
  return account.publicKey.toString();
}
