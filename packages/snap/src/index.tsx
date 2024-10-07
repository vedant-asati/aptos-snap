import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import type { Account } from '@aptos-labs/ts-sdk';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  Box,
  Text,
  Bold,
  Dropdown,
  Option,
  Heading,
  Copyable,
} from '@metamask/snaps-sdk/jsx';


import { getAccount, getPublicKey } from './cryptoUtils';

const MY_ACC_ADD = "0xc90b06d25184c230dffa5b7263180a194c7a4f3e1c29d6470c3feafece0372b8";
const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
const INITIAL_BALANCE = 100_000_000;
// const BOB_INITIAL_BALANCE = 100;
// const TRANSFER_AMOUNT = 100;

// const [accounts, setAccounts] = useState<number[]>([1, 3]);
const accounts = ['1', '3'];

// const selectAccountInterface = await snap.request({
//   method: "snap_createInterface",
//   params: {
//     ui: (
//       <Box>
//         <Text>Select an Account</Text>
//         <Dropdown name="currency">
//           {/* {
//             accounts.map((item, index) => (
//               <Option value={item}>Account {item}</Option>
//             )
//           } */}
//           <Option value="1">Account 1</Option>
//           <Option value="2">Account 2</Option>
//           <Option value="3">Account 3</Option>
//         </Dropdown>
//       </Box>
//     ),
//   },
// });

// await snap.request({
//   method: "snap_dialog",
//   params: {
//     type: "Alert",
//     id: selectAccountInterface,
//   },
// });

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
    case 'hello': {
      console.log('hello');
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: (
            <Box>
              <Text>Jai Siyaram!</Text>
              <Text>Shri Ramharshandasji Maharaj</Text>
              <Text>
                But you can edit the snap source code to make it do something,
                if you want to!
              </Text>
            </Box>
          ),
        },
      });
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
              <Heading>This is your publicKey</Heading>
              {/* // @TODO Fix type */}
              {/* <Copyable value={pubKey}>{pubKey}</Copyable> */}
            </Box>
          ),
        },
      });

      return pubKey;
    }
    case 'sign&sendTxn': {
      // const dappHost = 'localhost:8000';
      const { derivationPath } = request.params ?? {};

      const account = await getAccount(derivationPath);
      console.log("account: ", account);

      // Setup the client
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);
      // await aptos.fundAccount({
      //   accountAddress: account.accountAddress,
      //   amount: INITIAL_BALANCE,
      // });

      console.log('account have been funded!');

      // Look up the newly funded account's balances
      console.log("\n=== Balances ===\n");
      const aliceAccountBalance = await aptos.getAccountResource({
        accountAddress: account.accountAddress,
        resourceType: COIN_STORE,
      });
      const aliceBalance = Number(aliceAccountBalance.coin.value);
      console.log(`Alice's balance is: ${aliceBalance}`);

      // Send a transaction from Alice's account to Bob's account
      const txn = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          // All transactions on Aptos are implemented via smart contracts.
          function: '0x1::aptos_account::transfer',
          functionArguments: [MY_ACC_ADD, 100],
        },
      });

      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Approve Txn</Heading>
              <Text>{txn.toString()}</Text> // @TODO show txn details properly
            </Box>
          ),
        },
      });
      if (result !== true) throw new Error("User Denied Permission");

      console.log("\n=== Transfer transaction ===\n");
      // Both signs and submits
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: txn,
      });
      // Waits for Aptos to verify and execute the transaction
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      console.log("Transaction hash:", executedTransaction.hash);

      console.log("\n=== Balances after transfer ===\n");
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

      return executedTransaction.hash;
    }
    case 'jsr': {
      async function fetchData(url, options) {
        return await fetch(url, options);
      }
      const response = await fetchData('https://api.testnet.aptoslabs.com/v1', {
        method: 'GET',
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({
        //   key: value
        // }),
      });
      const data = await response.json();
      const dataString: string = JSON.stringify(data);

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: (
            <Box>
              <Heading>Jai Siyaram!</Heading>
              {/* <Copyable>{dataString}</Copyable> // @TODO show properly */}
            </Box>
          ),
        },
      });

      return data;
      // return "jsr";
    }

    default:
      throw new Error('Method not found.');
  }
};
