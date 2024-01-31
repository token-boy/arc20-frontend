import { useContext, useEffect, useState } from 'react'

import { GlobalContext } from '@/app/providers'
import { useToast } from '@chakra-ui/react'

interface Wallet {
  name: string
  logo: string
  isInstalled: boolean
  connect: () => Promise<void>
}

export interface Account {
  address: string
  provider: {
    name: string
    logo: string
  }
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])

  const { setAccount } = useContext(GlobalContext)

  const toast = useToast()

  useEffect(() => {
    const isInstalled = !!window.unisat

    // Unisat
    wallets.push({
      name: `${isInstalled ? '' : 'Install '}Unisat Wallet`,
      logo: '/unisat.svg',
      isInstalled: isInstalled,
      connect: async () => {
        if (!isInstalled) {
          window.open('https://unisat.io/download')
          return
        }
        const accounts = await window.unisat.requestAccounts()
        const account = {
          address: accounts[0],
          provider: {
            name: 'Unisat',
            logo: '/unisat.svg',
          },
        }
        setAccount(account)
        localStorage.set('account', JSON.stringify(account))
      },
    })

    // Atom
    wallets.push({
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
        const account = {
          address: accounts[0],
          provider: {
            name: 'Atom',
            logo: '/atom.png',
          },
        }
        setAccount(account)
        localStorage.setItem('account', JSON.stringify(account))
      },
    })

    setWallets([...wallets])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return wallets
}
