'use client'

import {
  Button,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { GlobalContext } from '../providers'
import { MEMPOOL_URL } from '@/utils/constants'
import WalletConnector from '@/components/WalletConnector'
import { useMount } from 'ahooks'
import CopyToClipboard from '@/components/CopyToClipboard'

function Page() {
  const { account } = useContext(GlobalContext)

  const [sessionId, setSessionId] = useState<string>()
  useMount(() => {
    setSessionId(localStorage.getItem('sessionId') ?? '')
  })

  return (
    <VStack align="flex-start" spacing={4}>
      <CopyToClipboard text={sessionId}>
      <Text>Session ID: {sessionId}</Text>

      </CopyToClipboard>
      {account ? (
        <>
          <HStack>
            <Text>Connected Wallet: </Text>
            <Image
              src={account?.provider.logo}
              alt={account?.provider.name}
              w={8}
            />
            <Text>{account?.provider.name}</Text>
          </HStack>
          <Text>
            Wallet Address:{' '}
            <Link
              href={`${MEMPOOL_URL}/address/${account?.address}`}
              target="_blank"
            >
              {account?.address}
            </Link>
          </Text>
        </>
      ) : (
        <WalletConnector>
          <Button>Connect Wallet</Button>
        </WalletConnector>
      )}
    </VStack>
  )
}

export default Page
