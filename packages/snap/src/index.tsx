import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import type { Account, RawTransaction } from '@aptos-labs/ts-sdk';
import type { Json, JsonRpcParams, OnRpcRequestHandler } from '@metamask/snaps-sdk';
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
import { bytesToHex, hexToBytes, stringifyBigInts, convertBytesToHexRecursively, fetchData } from './utils';
import { MY_ACC_ADD, APTOS_COIN, COIN_STORE, INITIAL_BALANCE } from './constants';
import { Operation, RequestParams, StateData, } from './types';
import { clearData, getData, setData } from './helpers';

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
      const { derivationPath }: ((Record<string, Json> | Json[]) & ExactOptionalGuard) & JsonRpcParams = request.params ?? {};

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
    case 'setData': {
      return setData(request.params);
    }

    case 'getData': {
      return getData();
    }

    case 'clearData': {
      return clearData();
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
