'use client'

import { Button, ButtonGroup, VStack } from '@chakra-ui/react'
import { useState } from 'react'

function Page() {
  const [op, setOp] = useState<'nft' | 'arc20' | 'realm' | 'dmint' | 'file'>()

  return (
    <VStack>
      <ButtonGroup spacing={1}>
        <Button
          borderRightRadius={0}
          size="sm"
          variant={op === 'nft' ? 'solid' : 'gray'}
          onClick={() => setOp('nft')}
        >
          NFT
        </Button>
        <Button
          borderRadius={0}
          size="sm"
          variant={op === 'arc20' ? 'solid' : 'gray'}
          onClick={() => setOp('arc20')}
        >
          ARC20
        </Button>
        <Button
          borderRadius={0}
          size="sm"
          variant={op === 'realm' ? 'solid' : 'gray'}
          onClick={() => setOp('realm')}
        >
          REALM
        </Button>
        <Button
          borderRadius={0}
          size="sm"
          variant={op === 'dmint' ? 'solid' : 'gray'}
          onClick={() => setOp('dmint')}
        >
          DMINT
        </Button>
        <Button
          borderLeftRadius={0}
          size="sm"
          variant={op === 'file' ? 'solid' : 'gray'}
          onClick={() => setOp('file')}
        >
          FILE
        </Button>
      </ButtonGroup>
    </VStack>
  )
}

export default Page
