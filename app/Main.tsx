'use client'

import { useState } from 'react'

import Nav from './Nav'
import { GlobalContext, ToastContainer } from './providers'
import type { Account } from '@/utils/wallet'

const Main: React.FC<{ children: React.ReactNode }> = (props) => {
  const [account, setAccount] = useState<Account>()

  return (
    <GlobalContext.Provider value={{ account, setAccount }}>
      <main>
        <Nav />
        {props.children}
      </main>
      <ToastContainer />
    </GlobalContext.Provider>
  )
}

export default Main
