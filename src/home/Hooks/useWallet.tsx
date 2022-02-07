import { ethers } from 'ethers'
import React from 'react'
import { useContext, useEffect, useState } from 'react'
// import useDeepCompareEffect from 'use-deep-compare-effect'

import { WalletContext } from '../Contexts/WalletContext'

// import useProvider from './useProvider'

type PropType = {
  children: React.ReactNode
}

export const WalletProvider = ({ children }: PropType) => {
  const [wallet, setWallet] = useState<ethers.Wallet | undefined>(undefined)
  // const provider = useProvider()

  useEffect(() => {
    // console.log('restore wallet', key)
    const getStoredWallet = async () => {
      chrome.storage.local.get(['gazelle_wallet'], async function (result) {
        const walletJson = result['gazelle_wallet']
        if (walletJson !== undefined) {
          const _wallet = await ethers.Wallet.fromEncryptedJson(
            walletJson,
            'pw',
          )
          setWallet(_wallet)

          // eslint-disable-next-line no-console
          console.log('Wallet Address: ', _wallet.address)
        }
      })
    }
    // eslint-disable-next-line no-console
    getStoredWallet().catch(console.error)
  }, [])

  // useDeepCompareEffect(() => {
  React.useEffect(() => {
    // console.log('use deep compare')
    // console.log('connect provider to wallet')
    // if (wallet !== undefined) {
    //   console.log('in connect provider: wallet not undefined')
    //   const connectedWallet = wallet.connect(provider)
    //   console.log('wallet old:', hashcode(wallet))
    //   console.log('wallet new:', hashcode(connectedWallet))
    //   setWallet(connectedWallet)
    // }

    const storeWallet = async () => {
      if (wallet !== undefined) {
        // console.log('in store wallet: wallet not undefined')
        const walletJson = await wallet.encrypt('pw', {
          scrypt: {
            // The number must be a power of 2 (default: 131072)
            N: 64,
          },
        })
        chrome.storage.local.set({ gazelle_wallet: walletJson })
      }
    }

    storeWallet()
  }, [wallet])

  // return [wallet, setWallet] as const

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  )
}

// export default useWallet
export const useWallet = () => useContext(WalletContext)
