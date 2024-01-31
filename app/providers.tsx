'use client'

import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { createStandaloneToast } from '@chakra-ui/react'

import theme from './theme'
import { Account } from '@/utils/wallet'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}

export const GlobalContext = React.createContext<{
  account?: Account
  setAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
}>({
  account: undefined,
  setAccount: function (
    value: React.SetStateAction<Account | undefined>
  ): void {
    throw new Error('Function not implemented.')
  },
})

const { ToastContainer, toast } = createStandaloneToast({
  defaultOptions: {
    position: 'top-right',
  }
})
export { ToastContainer, toast }
