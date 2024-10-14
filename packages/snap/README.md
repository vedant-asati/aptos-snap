# aptos-connect

[![NPM Version](https://img.shields.io/npm/v/aptos-connect.svg)](https://www.npmjs.com/package/aptos-connect)

`aptos-connect` is a MetaMask Snap that allows users to interact with the Aptos blockchain directly from MetaMask. This Snap provides several key functionalities related to Aptos, including account management, signing messages, and sending transactions.

## Features

- **Account Management:** Generate new Aptos accounts, view public and private keys, and get account addresses.
- **Transaction Signing:** Sign and send transactions on the Aptos blockchain, including transferring funds.
- **Message Signing:** Sign arbitrary messages with your Aptos private key directly from MetaMask.
- **Data Persistence:** Save and retrieve encrypted data within MetaMask sessions.
- **RPC Interaction:** Perform various Aptos blockchain operations using RPC methods such as checking account balances, transaction history, and more.

## Installation

To integrate Aptos Connect into your project, install the npm package:

```bash
npm install aptos-connect
```

## Usage

To interact with the Snap, use `wallet_invokeSnap` from MetaMask:

### Example: Retrieve Account Address

```typescript
const accountAddress = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:aptos-connect',
    request: { method: 'getAccountAddress' },
  },
});
console.log('Account Address:', accountAddress);
```

### Example: Sign and Send a Transaction

```typescript
const txnHash = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:aptos-connect',
    request: {
      method: 'sign&sendTxn',
      params: {
        derivationPath: "m/44'/637'/0'/0'/0'",
        txnDetails: { receiver: '0x1...', amount: 1000 },
      },
    },
  },
});
console.log('Transaction Hash:', txnHash);
```

### Available RPC Methods

- **getAccountAddress**: Retrieve the Aptos account address for a given derivation path.
- **getPublicKey**: Get the public key for the specified derivation path.
- **getPrivateKey**: Obtain the private key (for advanced use cases).
- **createNewAccount**: Generate a new Aptos account.
- **signMessage**: Sign a message using the account's private key.
- **sign&sendTxn**: Sign and send a transaction on the Aptos blockchain.
- **setData**: Save data in MetaMask's encrypted storage.
- **getData**: Retrieve data stored within the session.
- **clearData**: Clear all stored data from the session.

Check the full list of RPC methods in the [source code](./src/index.tsx).

## Local Development

Clone the repository and install dependencies to start developing locally:

```bash
git clone https://github.com/vedant-asati/aptos-snap.git
cd packages/snap
yarn install
yarn start
```

To use the locally started Snap, point MetaMask to `local:http://localhost:8080` as the Snap ID.

## License

This project is licensed under both the [Apache 2.0 License](./LICENSE.APACHE2) and [MIT License](./LICENSE.MIT0).
