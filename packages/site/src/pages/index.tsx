import styled from 'styled-components';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useInvokeSnap,
  useMetaMaskContext,
  useRequestSnap,
} from '../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';
import type { AccountData } from 'src/types/custom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Select = styled.select`
  padding: 0.8rem 1.2rem;
  font-size: 1.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.default};
  background-color: ${({ theme }) => theme.colors.background?.default};
  color: ${({ theme }) => theme.colors.text?.default};
  width: 100%;
  max-width: 20rem;
  margin-bottom: 1.5rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary?.default};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary?.default};
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
  }

  option {
    background-color: ${({ theme }) => theme.colors.background?.default};
    color: ${({ theme }) => theme.colors.text?.default};
    font-size: 1.6rem;
  }
`;

const AccountDropdown = (
  {
    accounts,
    setActiveAccount,
    toggleFetch,
    setToggleFetch,
  }: {
    accounts: AccountData[],
    setActiveAccount: (account: AccountData) => void
  }
) => {

  const handleAccountChange = (e) => {
    setActiveAccount(accounts[e.target.value] as AccountData);
  };

  return (
    // @TODO fix
    <Select onChange={handleAccountChange} onClick={() => setToggleFetch(!toggleFetch)}>
      {accounts.map((account: AccountData, index: number) => (
        <option key={index} value={index}>
          {account.name}
        </option>
      ))}
    </Select>
  );
};

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  // Standard: m / purpose' / coin_type' / account' / change / address_index
  // derivation path to be appended to [`m`, `44'`, `637'`]

  const [accounts, setAccounts] = useState<AccountData[]>([
    {
      name: 'Account 0',
      derivationPath: [`0'`, `0'`]
    },
    {
      name: 'Account 1',
      derivationPath: [`1'`, `0'`]
    },
    {
      name: 'Account 2',
      derivationPath: [`2'`, `0'`]
    },
    {
      name: 'Account 3',
      derivationPath: [`3'`, `0'`]
    },
    {
      name: 'Account 4',
      derivationPath: [`4'`, `0'`]
    },
  ])
  const [activeAccount, setActiveAccount] = useState<AccountData | undefined>(accounts[0]);
  const [toggleFetch, setToggleFetch] = useState(true);

  // @TODO fix
  const getData = async () => {
    const data = await invokeSnap({ method: 'getData' });
    console.log(data);
    if (data?.accounts) {
      setAccounts(data.accounts);
      setActiveAccount(data.accounts[0]);
    };
  };

  useEffect(() => {
    getData();
    return console.log("hi")
  }, [toggleFetch]);

  const [txnReceiverAddress, setTxnReceiverAddress] = useState<string>('');
  const [storageKey, setStorageKey] = useState<string>('');
  const [storageValue, setStorageValue] = useState<string>('');
  const [txnAmount, setTxnAmount] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('')

  const handleJSR = async () => {
    const data = await invokeSnap({ method: 'jsr' });
    console.log(data);
  };
  const handleGetAccountAddress = async () => {
    const pubKey = await invokeSnap({
      method: 'getAccountAddress',
      params: {
        derivationPath: activeAccount?.derivationPath,
        confirm: true, // @DEV not needed
      },
    });
  };
  const handleGetPublicKey = async () => {
    const pubKey = await invokeSnap({
      method: 'getPublicKey',
      params: {
        derivationPath: activeAccount?.derivationPath,
        confirm: true, // @DEV not needed
      },
    });
  };
  const handleGetPrivateKey = async () => {
    const res = await invokeSnap({
      method: 'getPrivateKey',
      params: {
        derivationPath: activeAccount?.derivationPath,
        confirm: true, // @DEV not needed
      },
    });
  };
  const handleCreateNewAccount = async () => {
    const index = accounts.length;
    if (!index) console.error('index isn\'t defined');
    const newDerivationPath = [`${index}'`, "0'"];

    const res = await invokeSnap({
      method: 'createNewAccount',
      params: {
        derivationPath: newDerivationPath,
      },
    });
    console.log(res);

    // if (res) {
    //   setAccounts((prev) => [
    //     ...prev,
    //     {
    //       name: `Account ${index}`,
    //       derivationPath: [`${index}'`, "0'"]
    //     },
    //   ])
    // }

    if (res) {
      const newAccount = {
        name: `Account ${index}`,
        derivationPath: newDerivationPath,
      };
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      setActiveAccount(newAccount);

      // Save accounts to MetaMask storage
      await invokeSnap({
        method: 'setData',
        params: { key: 'accounts', value: updatedAccounts },
      });
    }
    return;
  };
  const handleTestSendTxn = async () => {
    const res = await invokeSnap({
      method: 'test_sign&sendTxn',
      params: {
        derivationPath: activeAccount?.derivationPath,
      },
    });
    console.log(res);
  };
  const handleSendTxn = async () => {
    console.log(txnReceiverAddress)
    console.log(txnAmount)
    const res = await invokeSnap({
      method: 'sign&sendTxn',
      params: {
        derivationPath: activeAccount?.derivationPath,
        txnDetails: {
          receiver: txnReceiverAddress || "0x0",
          amount: txnAmount,
        }
      },
    });
    console.log(res);
  };
  const handleTestSignTxn = async () => {
    const res = await invokeSnap({
      method: 'test_SignTxn',
      params: {
        derivationPath: activeAccount?.derivationPath,
      },
    });
    console.log(res);
  };
  const handleSignTxns = async () => {
    const res = await invokeSnap({
      method: 'signAllTransactions',
      params: {
        derivationPath: activeAccount?.derivationPath,
        messages: ['Jai Siyaram!', '0xab7896'],
      },
    });
    console.log(res);
  };
  const handleSignMsg = async () => {
    const res = await invokeSnap({
      method: 'signMessage',
      params: {
        derivationPath: activeAccount?.derivationPath,
        message: messageText || 'Jai Siyaram!',
      },
    });
    console.log(res);
  };
  const handleSetData = async () => {
    const res = await invokeSnap({
      method: 'setData',
      params: {
        key: storageKey || 'cool',
        value: storageValue || 'its fine',
      },
    });
    console.log(res);
  };
  const handleGetData = async () => {
    const res = await invokeSnap({
      method: 'getData',
      // params: {
      //   derivationPath: activeAccount?.derivationPath,
      //   message: messageText || 'Jai Siyaram!',
      // },
    });
    console.log(res);
  };
  const handleClearData = async () => {
    const res = await invokeSnap({
      method: 'clearData',
      // params: {
      //   derivationPath: activeAccount?.derivationPath,
      //   message: messageText || 'Jai Siyaram!',
      // },
    });
    console.log(res);
  };

  const handleChange = (e) => {
    switch (e.target.name) {
      case 'amount': {
        setTxnAmount(e.target.value);
        break;
      }
      case 'receiverAddress': {
        setTxnReceiverAddress(e.target.value);
        break;
      }
      case 'messageText': {
        setMessageText(e.target.value);
        break;
      }
      case 'storageKey': {
        setStorageKey(e.target.value);
        break;
      }
      case 'storageValue': {
        setStorageValue(e.target.value);
        break;
      }

      default:
        break;
    }
  }

  return (
    <Container>
      <Heading>
        Welcome to <Span>Aptos-snap Interface</Span>
      </Heading>
      <Subtitle>
        Get started by clicking on buttons below.
        {/* <button type="button" onClick={() => setToggleFetch(!toggleFetch)}>toggleFetch</button> */}
      </Subtitle>
      <br />
      <AccountDropdown setToggleFetch={setToggleFetch} toggleFetch={toggleFetch} accounts={accounts} setActiveAccount={setActiveAccount} />
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send JSR message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleJSR}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Send Message',
            description:
              <>
                <label htmlFor="messageText">Message: </label>
                <input type="text" name="messageText" id="messageText" placeholder='type your message...' value={messageText} onChange={handleChange} /> <br />
              </>,
            button: (
              <SendHelloButton
                onClick={handleSignMsg}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Send Txn',
            description:
              <>
                <label htmlFor="receiverAddress">Receiver: </label>
                <input type="text" name="receiverAddress" id="receiverAddress" placeholder='address of receiver...' value={txnReceiverAddress} onChange={handleChange} /> <br />
                <label htmlFor="amount">Amount: </label>
                <input type="text" name="amount" id="amount" placeholder='amount to send...' value={txnAmount} onChange={handleChange} />
              </>,
            // 'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendTxn}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Create a new Account',
            description:
              <>
                <button onClick={handleCreateNewAccount} disabled={!installedSnap}>Create New Acc</button>
              </>,
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Test',
            description:
              <>
                <button onClick={handleTestSignTxn} disabled={!installedSnap} >Sign Test Txn</button>
                <button onClick={handleSignTxns} disabled={!installedSnap}>Sign Multi Txn</button>
              </>,
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Active Accounts Details',
            description:
              <>
                <button onClick={handleGetAccountAddress} disabled={!installedSnap} >Get AccountAddress</button> <br /> <hr style={{ border: '0px', margin: '4px' }} />
                <button onClick={handleGetPublicKey} disabled={!installedSnap} >Get PublicKey</button> &nbsp;
                <button onClick={handleGetPrivateKey} disabled={!installedSnap} >Get PrivateKey</button>
              </>,
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Encrypt & Save Data',
            description:
              <>
                <label htmlFor="receiverAddress">Key: </label>
                <input type="text" name="storageKey" id="storageKey" placeholder='storage Key...' value={storageKey} onChange={handleChange} /> <br />
                <label htmlFor="amount">Value: </label>
                <input type="text" name="storageValue" id="storageValue" placeholder='Value to store...' value={storageValue} onChange={handleChange} /> <br /><br />
                <button onClick={handleSetData} disabled={!installedSnap} >Send Data</button> &nbsp;
                <button onClick={handleGetData} disabled={!installedSnap} >Get Data</button> &nbsp;
                <button onClick={handleClearData} disabled={!installedSnap} >Clear</button>
              </>,
            // 'Display a custom message within a confirmation screen in MetaMask.',
            // button: (
            //   <SendHelloButton
            //     onClick={handleSetData}
            //     disabled={!installedSnap}
            //   />
            // ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />

        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
