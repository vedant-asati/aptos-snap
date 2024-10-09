import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import type { Account, RawTransaction } from '@aptos-labs/ts-sdk';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  Box,
  Text,
  Bold,
  Divider,
  Dropdown,
  Option,
  Heading,
  Copyable,
} from '@metamask/snaps-sdk/jsx';

import { getAccount, getAccountAddress, getPrivateKey, getPublicKey } from './cryptoUtils';
import { bytesToHex, hexToBytes } from './utils';

const MY_ACC_ADD =
  '0xc90b06d25184c230dffa5b7263180a194c7a4f3e1c29d6470c3feafece0372b8';
const APTOS_COIN = '0x1::aptos_coin::AptosCoin';
const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
const INITIAL_BALANCE = 100_000_000;
const accounts = ['1', '3'];

// const selectAccountInterface = await snap.request({
//   method: 'snap_createInterface',
//   params: {
//     ui: (
//       <Box>
//         <Text>Select an Account</Text>
//         <Dropdown name='currency'>
//           {/* {
//             accounts.map((item, index) => (
//               <Option value={item}>Account {item}</Option>
//             )
//           } */}
//           <Option value='1'>Account 1</Option>
//           <Option value='2'>Account 2</Option>
//           <Option value='3'>Account 3</Option>
//         </Dropdown>
//       </Box>
//     ),
//   },
// });

// await snap.request({
//   method: 'snap_dialog',
//   params: {
//     type: 'Alert',
//     id: selectAccountInterface,
//   },
// });

/**
 * Stringify and handle bigints.
 *
 * @param obj - any object that is suitble.
 * @returns the updated object.
 * @throws when its not met.
 */
function stringifyBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString(); // Convert BigInt to string
  } else if (Array.isArray(obj)) {
    return obj.map(stringifyBigInts); // Recursively convert BigInt in arrays
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, stringifyBigInts(value)]),
    ); // Recursively convert BigInt in objects
  }
  return obj; // Return other types as-is
}
/**
 *
 * @param obj
 */
function convertBytesToHexRecursively(obj: any[] | RawTransaction | null): string | any | any[] {
  if (Array.isArray(obj)) {
    return obj.map(convertBytesToHexRecursively);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Check if 'data' field exists and convert it to hex
        if (
          obj[key] &&
          typeof obj[key] === 'object' &&
          obj[key].data !== undefined
        ) {
          newObj[key] = bytesToHex(Object.values(obj[key].data));
        } else if (key === 'args' && Array.isArray(obj[key])) {
          // Special case for 'args' array that contains objects with 'data'
          newObj[key] = obj[key].map((item) => {
            if (item.data !== undefined) {
              return bytesToHex(Object.values(item.data));
            }
            return item;
          });
        } else {
          // Recurse through nested objects/arrays
          newObj[key] = convertBytesToHexRecursively(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
}
/**
 *
 * @param url
 * @param options
 */
async function fetchData(
  url: RequestInfo | URL,
  options: RequestInit | undefined,
) {
  return await fetch(url, options);
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'getAccountAddress': {
      const { derivationPath } = request.params ?? {};

      const pubKey: string = await getAccountAddress(derivationPath);
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Text>Account Address</Text>
              <Copyable value={pubKey} />
            </Box>
          ),
        },
      });

      return pubKey;
    }
    case 'getPublicKey': {
      const { derivationPath } = request.params ?? {};

      const pubKey: string = await getPublicKey(derivationPath);
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Text>Public Key</Text>
              <Copyable value={pubKey} />
            </Box>
          ),
        },
      });

      return pubKey;
    }
    case 'getPrivateKey': {
      const { derivationPath } = request.params ?? {};

      const sk: string = await getPrivateKey(derivationPath);
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Text>Private Key</Text>
              <Copyable value={sk} sensitive />
            </Box>
          ),
        },
      });

      return sk;
    }
    case 'createNewAccount': {
      const { derivationPath } = request.params ?? {};

      const pubKey: string = await getPublicKey(derivationPath);
      const accAdd: string = await getAccountAddress(derivationPath);
      const sk: string = await getPrivateKey(derivationPath);

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Heading>Your Account details:</Heading>
              <Text>Account Address</Text>
              <Copyable value={accAdd} />
              <Text>Public Key</Text>
              <Copyable value={pubKey} />
              <Text>Private Key</Text>
              <Copyable value={sk} sensitive />
            </Box>
          ),
        },
      });

      return accAdd;
    }
    case 'signMessage': {
      const { derivationPath, message } = request.params ?? {};

      const account = await getAccount(derivationPath);
      const sig = account.sign(message || 'Jai Siyaram!');

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Text>Message</Text>
              <Copyable value={message || 'Jai Siyaram!'} />
              <Text>Signature</Text>
              <Copyable value={sig.toString()} />
            </Box>
          ),
        },
      });

      return sig.toString();
    }
    case 'test_SignTxn': {
      const { derivationPath } = request.params ?? {};

      const account = await getAccount(derivationPath);

      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);

      const txn = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          // All transactions on Aptos are implemented via smart contracts.
          function: '0x1::aptos_account::transfer',
          functionArguments: [MY_ACC_ADD, 100],
        },
      });
      const sig = account.signTransaction(txn);

      const txnForDisplay = stringifyBigInts(
        convertBytesToHexRecursively(txn.rawTransaction),
      );

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Heading>Transaction Details</Heading>
              {/* // @TODO show txn details properly */}
              <Text>{JSON.stringify(txnForDisplay, null, 2)}</Text>
              <Copyable value={sig.toString()} />
            </Box>
          ),
        },
      });

      return sig.toString();
    }
    case 'sign&sendTxn': {
      const { derivationPath, txnDetails } = request.params ?? {};

      if (!txnDetails.receiver || !txnDetails.amount) throw new Error('Txn Details not present.')

      const account = await getAccount(derivationPath);
      console.log('account: ', account);

      // Setup the client
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);
      try {
        await aptos.fundAccount({
          accountAddress: account.accountAddress,
          amount: INITIAL_BALANCE,
        });
        console.log('account have been funded!');
      } catch (error) {
        console.log('account could not be funded!');
        console.log(error);
      }

      try {
        console.log('\n=== Balances ===\n');
        const aliceAccountBalance = await aptos.getAccountResource({
          accountAddress: account.accountAddress,
          resourceType: COIN_STORE,
        });
        const aliceBalance = Number(aliceAccountBalance.coin.value);
        console.log(`Alice's balance is: ${aliceBalance}`);
      } catch (error) {
        console.log('account could not be funded!');
        console.log(error);
      }

      const txn = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: '0x1::aptos_account::transfer',
          functionArguments: [txnDetails.receiver, txnDetails.amount],
        },
      });

      const sig = account.signTransaction(txn);

      const txnForDisplay = stringifyBigInts(
        convertBytesToHexRecursively(txn.rawTransaction),
      );

      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Approve Transaction</Heading>
              {/* // @TODO show txn details properly */}
              <Text>{JSON.stringify(txnForDisplay, null, 2)}</Text>
              <Text>Signature</Text>
              <Copyable value={sig.toString()} />
            </Box>
          ),
        },
      });
      if (result !== true) {
        throw new Error('User Denied Permission');
      }

      console.log('\n=== Transfer transaction ===\n');
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: txn,
      });
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      console.log('Transaction hash:', executedTransaction.hash);

      try {
        console.log('\n=== Balances after transfer ===\n');
        const newAliceAccountBalance = await aptos.getAccountResource({
          accountAddress: account.accountAddress,
          resourceType: COIN_STORE,
        });
        const newAliceBalance = Number(newAliceAccountBalance.coin.value);
        console.log(`Alice's balance is: ${newAliceBalance}`);

        const newBobAccountBalance = await aptos.getAccountResource({
          accountAddress: txnDetails.receiver,
          resourceType: COIN_STORE,
        });
        const newBobBalance = Number(newBobAccountBalance.coin.value);
        console.log(`Bob's balance is: ${newBobBalance}`);
      } catch (error) {
        console.log('account could not be funded!');
        console.log(error);
      }

      return executedTransaction.hash;
    }
    case 'test_sign&sendTxn': {
      const { derivationPath } = request.params ?? {};

      const account = await getAccount(derivationPath);
      console.log('account: ', account);

      // Setup the client
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);
      try {
        await aptos.fundAccount({
          accountAddress: account.accountAddress,
          amount: INITIAL_BALANCE,
        });
        console.log('account have been funded!');
      } catch (error) {
        console.log('account could not be funded!');
        console.log(error);
      }

      try {
        console.log('\n=== Balances ===\n');
        const aliceAccountBalance = await aptos.getAccountResource({
          accountAddress: account.accountAddress,
          resourceType: COIN_STORE,
        });
        const aliceBalance = Number(aliceAccountBalance.coin.value);
        console.log(`Alice's balance is: ${aliceBalance}`);
      } catch (error) {
        console.log('account could not be funded!');
        console.log(error);
      }

      const txn = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          // All transactions on Aptos are implemented via smart contracts.
          function: '0x1::aptos_account::transfer',
          functionArguments: [MY_ACC_ADD, 100],
        },
      });
      const sig = account.signTransaction(txn);

      const txnForDisplay = stringifyBigInts(
        convertBytesToHexRecursively(txn.rawTransaction),
      );

      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Approve Transaction</Heading>
              {/* // @TODO show txn details properly */}
              <Text>{JSON.stringify(txnForDisplay, null, 2)}</Text>
              <Text>Signature</Text>
              <Copyable value={sig.toString()} />
            </Box>
          ),
        },
      });
      if (result !== true) {
        throw new Error('User Denied Permission');
      }

      console.log('\n=== Transfer transaction ===\n');
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: txn,
      });
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      console.log('Transaction hash:', executedTransaction.hash);

      try {
        console.log('\n=== Balances after transfer ===\n');
        const newAliceAccountBalance = await aptos.getAccountResource({
          accountAddress: account.accountAddress,
          resourceType: COIN_STORE,
        });
        const newAliceBalance = Number(newAliceAccountBalance.coin.value);
        console.log(`Alice's balance is: ${newAliceBalance}`);

        const newBobAccountBalance = await aptos.getAccountResource({
          accountAddress: MY_ACC_ADD,
          resourceType: COIN_STORE,
        });
        const newBobBalance = Number(newBobAccountBalance.coin.value);
        console.log(`Bob's balance is: ${newBobBalance}`);
      } catch (error) {
        console.log('account could not be funded!');
        console.log(error);
      }

      return executedTransaction.hash;
    }
    case 'jsr': {
      const response = await fetchData('https://api.testnet.aptoslabs.com/v1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Heading>Jai Siyaram!</Heading>
              <Text>Aptos RPC Fetch</Text>
              <Copyable value={JSON.stringify(data, null, 2)}></Copyable>
              <Divider />
              <Text>Systems Operational!</Text>
            </Box>
          ),
        },
      });

      return data;
      // return 'jsr';
    }

    default:
      throw new Error('Method not found.');
  }
};
