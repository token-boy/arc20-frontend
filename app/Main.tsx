'use client'

import { useState } from 'react'
import { useMount } from 'ahooks'

import Nav from './Nav'
import { GlobalContext, ToastContainer } from './providers'
import type { Account } from '@/utils/wallet'

const Main: React.FC<{ children: React.ReactNode }> = (props) => {
  const [account, setAccount] = useState<Account>()

  useMount(() => {
    const sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      localStorage.setItem('sessionId', Math.random().toString(36).slice(2))
    }
  })

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
