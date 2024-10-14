# MetaMask Snap for Aptos
[![NPM Version](https://img.shields.io/npm/v/aptos-connect.svg)](https://www.npmjs.com/package/aptos-connect)
[![Netlify Status](https://api.netlify.com/api/v1/badges/d2fdddce-cf7f-420f-86db-92d59f3e45c0/deploy-status)](https://app.netlify.com/sites/aptos/deploys)

Aptos Connect is a MetaMask Snap that allows users to interact with the Aptos blockchain directly from MetaMask. This snap provides various Aptos-related functionalities, such as generating accounts, signing messages, and sending transactions.

## Live Demo
#### Example website: https://aptos.netlify.app/

#### Demo Video: https://youtu.be/f2-FAUYnf-g

## Installation
To use Aptos Connect in your project, install the npm package:

```bash
npm install aptos-connect
```

## Features

- **Account Management:** Generate new Aptos accounts, view public and private keys, and get account addresses.
- **Transaction Signing:** Sign and send Aptos transactions, including funding accounts and transferring Aptos coins.
- **Message Signing:** Sign arbitrary messages directly from MetaMask.
- **Data Persistence:** Save and retrieve data across sessions.
- **RPC Interaction:** Perform RPC requests to Aptos nodes for account balances, transaction history, and more.

## Project Structure

```bash
...
packages/
  site/        # Frontend application built using Gatsby
    src/
      components/  # React components for UI
      pages/       # Main app pages (index.tsx)
      utils/       # Helper functions
  snap/        # MetaMask Snap logic
    src/
      cryptoUtils.ts    # Utility functions for key management
      index.tsx         # Main Snap logic, handling RPC requests
      utils.ts          # Aptos-specific utilities
...
```

### RPC Methods

- **getAccountAddress**: Retrieve the Aptos account address for a given derivation path.
- **getPublicKey**: Get the public key for the specified derivation path.
- **getPrivateKey**: Obtain the private key (sensitive).
- **createNewAccount**: Generate a new Aptos account.
- **signMessage**: Sign a message with the private key.
- **sign&sendTxn**: Sign and send a transaction on the Aptos blockchain.
- **setData**: Save data in metamask's encrypted storage.
- **getData**: Retrieve data.
- **clearData**: Clear all data.

Check more about all rpc methods [here](./packages/snap/src/index.tsx).


<!-- ## Usage

### MetaMask Snap Integration

To integrate the Aptos Snap into your MetaMask-enabled dApp, invoke the Snap with the `wallet_invokeSnap` method:

```typescript
await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:aptos-connect',
    request: { method: 'getAccountAddress' }
  },
});
```

You can interact with various RPC methods available in the snap, including:

- `getAccountAddress`
- `getPublicKey`
- `getPrivateKey`
- `createNewAccount`
- `signMessage`
- `sign&sendTxn`

For a full list of available methods, see the [snap source code](./packages/snap/src/index.tsx).

### Example: Creating a New Account

```typescript
const accountAddress = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:aptos-connect',
    request: { method: 'createNewAccount' },
  },
});
console.log('New Account Address:', accountAddress);
```

### Example: Signing and Sending a Transaction

```typescript
const txnHash = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:aptos-connect',
    request: {
      method: 'sign&sendTxn',
      params: {
        derivationPath: "m/44'/637'/0'/0'/0'",
        txnDetails: { receiver: '0x1..', amount: 1000 },
      },
    },
  },
});
console.log('Transaction Hash:', txnHash);
``` -->

## Development

To run the project locally, clone the repository and install dependencies using Yarn:

```bash
git clone https://github.com/vedant-asati/aptos-snap.git
yarn install
yarn start
```

Frontend development:

```bash
cd packages/site
yarn install
yarn start
```

Snap development:

```bash
cd packages/snap
yarn install
yarn start
```

### Using the snap

The production snap is available as Snap ID: `npm:aptos-connect`.

The locally started snap is available as Snap ID: `local:http://localhost:8080`.

## License

This project is licensed under the [Apache 2.0 License](./LICENSE.APACHE2) and [MIT License](./LICENSE.MIT0).
