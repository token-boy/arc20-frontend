import { useContext, useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import { GlobalContext } from '@/app/providers'
import { request } from './request'

interface Wallet {
  name: string
  logo: string
  isInstalled: boolean
  connect: () => Promise<void>
  getBalance: () => Promise<{
    confirmed: number
    unconfirmed: number
    total: number
  }>
  sendBitcoin: (toAddress: string, satoshis: number) => Promise<void>
}

export interface Account {
  address: string
  provider: {
    name: string
    logo: string
  }
}

export function useWallets() {
  const [wallets, setWallets] = useState<Dict<Wallet>>({})

  const { setAccount } = useContext(GlobalContext)

  const toast = useToast()

  useEffect(() => {
    const isInstalled = !!window.unisat

    // Unisat
    wallets['Unisat'] = {
      name: `${isInstalled ? '' : 'Install '}Unisat Wallet`,
      logo: '/unisat.svg',
      isInstalled: isInstalled,
      connect: async () => {
        if (!isInstalled) {
          window.open('https://unisat.io/download')
          return
        }

        const accounts = await window.unisat.requestAccounts()
        const pubkey = await window.unisat.getPublicKey()
        const signature = await window.unisat.signMessage(
          localStorage.getItem('sessionId')
        )

        await request('sessions', {
          method: 'POST',
          payload: {
            address: accounts[0],
            pubkey,
            signature,
          },
        })

        const account: Account = {
          address: accounts[0],
          provider: {
            name: 'Unisat',
            logo: '/unisat.svg',
          },
        }
        // account.sendBitcoin
        setAccount(account)
        localStorage.set('account', JSON.stringify(account))
      },
      getBalance: () => {
        return window.unisat.getBalance()
      },
      sendBitcoin: (toAddress, satoshis) => {
        return window.unisat.sendBitcoin(toAddress, satoshis)
      },
    }

    // Atom
    wallets['Atom'] = {
      name: `${isInstalled ? '' : 'Install '}Atom Wallet`,
      logo: '/atom.png',
      isInstalled: isInstalled,
      connect: async () => {
        if (!isInstalled) {
          toast({
            title: 'Atom wallet not installed',
            status: 'error',
            position: 'top-right',
          })
          return
        }

        const accounts = await window.wizz.requestAccounts()
        const pubkey = await window.wizz.getPublicKey()
        const signature = await window.wizz.signMessage(
          localStorage.getItem('sessionId')
        )

        await request('sessions', {
          method: 'POST',
          payload: {
            address: accounts[0],
            pubkey,
            signature,
          },
        })

        const account: Account = {
          address: accounts[0],
          provider: {
            name: 'Atom',
            logo: '/atom.png',
          },
        }
        setAccount(account)
        localStorage.setItem('account', JSON.stringify(account))
      },
      getBalance: () => {
        return window.wizz.getBalance()
      },
      sendBitcoin: (toAddress, satoshis) => {
        return window.wizz.sendBitcoin(toAddress, satoshis)
      },
    }

    setWallets({ ...wallets })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return wallets
}
