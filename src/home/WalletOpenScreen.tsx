import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import truncateString from '../utils'

import { useWallet } from './Hooks/useWallet'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import TransactionStatusCard, {
  TransactionStatus,
} from './TransactionStatusCard'

// enum TransactionStatus {
//   pending = 1,
//   confirmed,
//   failed,
// }

function WalletOpenScreen() {
  const [ETHBalance, setETHBalance] = useState<BigNumber>(ethers.constants.Zero)
  const [transactionAddress, setTransactionAddress] = useState<string>('')
  const [transactionETHAmount, setTransactionETHAmount] = useState<string>('0')
  const { wallet, setWallet } = useWallet() as {
    wallet: ethers.Wallet
    setWallet: React.Dispatch<React.SetStateAction<ethers.Wallet | undefined>>
  }
  // const [menuState, setMenuState] = useState(1)
  const [transactionStatus, setTransactionStatus] = useState(0)

  const yellow_stroke = chrome.runtime.getURL('images/yellow_stroke.svg')

  useEffect(() => {
    if (transactionStatus >= 2) {
      setTimeout(() => setTransactionStatus(0), 6000)
    }
  }, [transactionStatus])

  useEffect(() => {
    if (wallet && wallet.provider) {
      //   console.log('handler set')
      wallet.provider.once('block', (blockNumber) => {
        // eslint-disable-next-line no-console
        console.log('New block was minted!', blockNumber)
        wallet.provider
          .getBalance(wallet.address)
          .then((balance) => {
            if (!balance.eq(ETHBalance)) {
              setETHBalance(balance)
            }
          })
          // eslint-disable-next-line no-console
          .catch(console.error)
      })
    }
  }, [wallet, ETHBalance])

  function onSubmitTransaction() {
    // Create a transaction object
    setTransactionStatus(1)
    const tx = {
      to: transactionAddress,
      // Convert currency unit from ether to wei
      value: ethers.utils.parseEther(transactionETHAmount),
    }
    // eslint-disable-next-line no-console
    console.log(tx)
    // Send a transaction
    if (wallet !== undefined) {
      wallet
        .sendTransaction(tx)
        .then(async (txObj) => {
          // eslint-disable-next-line no-console
          console.log('txHash', txObj.hash)
          txObj
            .wait(3)
            .then(() => {
              setTransactionStatus(2)
            })
            .catch(() => {
              setTransactionStatus(3)
            })
        })
        .catch(() => {
          setTransactionStatus(3)
        })
    }
  }

  function onDestroyWallet() {
    chrome.storage.local.remove(['gazelle_wallet'], function () {
      setWallet(undefined)
    })
  }

  return (
    <div>
      <div className="flex flex-row justify-between align-middle">
        <div>
          <div className="text-2xl font-bold">Public Address</div>
          <div className="text-xl">
            {truncateString(wallet.address, 20, '...')}
          </div>
        </div>
        <div className="">
          <div className="text-2xl font-bold">ETH Balance</div>
          <div className="text-xl">{ethers.utils.formatEther(ETHBalance)}</div>
        </div>
        <div className="flex flex-col justify-center">
          <SecondaryButton text="Destroy wallet" onClick={onDestroyWallet} />
        </div>
      </div>

      <div className="mt-8 h-32">
        <div
          className="-ml-4 w-fit bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${yellow_stroke})` }}
        >
          <span className="p-4 text-3xl">Assets</span>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="mt-8">
          <div
            className="-ml-4 w-fit bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${yellow_stroke})` }}
          >
            <span className="p-4 text-3xl">Send ETH</span>
          </div>

          <form action="" className="w-4/5">
            <div>
              <label
                htmlFor="text"
                className="block text-xl font-medium text-gray-700"
              >
                Public Address
              </label>
              <div className="mt-1">
                <input
                  id="pub_adress"
                  name="pub_adress"
                  type="text"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  onChange={(e) => setTransactionAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="text"
                className="block text-xl font-medium text-gray-700"
              >
                ETH Amount
              </label>
              <div className="mt-1">
                <input
                  id="eth_amount"
                  name="eth_amount"
                  type="text"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  onChange={(e) => setTransactionETHAmount(e.target.value)}
                />
              </div>
            </div>
          </form>
          {/* <TransactionStatus /> */}
          <div className="mt-4 flex flex-col justify-items-start">
            <PrimaryButton
              text="Submit Transaction"
              onClick={onSubmitTransaction}
            />
          </div>
        </div>

        <div className="mt-8">
          <div
            className="-ml-4 w-fit bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${yellow_stroke})` }}
          >
            <span className="p-4 text-3xl">Transactions</span>
          </div>

          <div className="grid-col1 mt-4 grid space-y-2">
            <TransactionStatusCard
              transactionType="Send ETH"
              transactionDate={new Date()}
              transactionStatus={TransactionStatus.pending}
            />
            <TransactionStatusCard
              transactionType="Send ETH"
              transactionDate={new Date()}
              transactionStatus={TransactionStatus.confirmed}
            />
            <TransactionStatusCard
              transactionType="Send ETH"
              transactionDate={new Date()}
              transactionStatus={TransactionStatus.failed}
            />
          </div>
        </div>
      </div>
      {/* <div className="mt-8 flex flex-row justify-start">
        <div>
          <MenuButton
            text="Send ETH"
            isActive={menuState == 1}
            onClick={() => setMenuState(1)}
          />
        </div>
        <div className="ml-4">
          <MenuButton
            text="Past transaction"
            isActive={menuState == 2}
            onClick={() => setMenuState(2)}
          />
        </div>
        <div className="ml-4">
          <MenuButton
            text="Assets"
            isActive={menuState == 3}
            onClick={() => setMenuState(3)}
          />
        </div>
      </div> */}
    </div>
  )
}

export default WalletOpenScreen
