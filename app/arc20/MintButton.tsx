'use client'

import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaHammer } from 'react-icons/fa'

const MintButton: React.FC<{
  name: string
  isDisabled: boolean
}> = (props) => {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="xs"
      fontSize={14}
      p={3}
      leftIcon={<FaHammer />}
      isDisabled={props.isDisabled}
      onClick={(e) => {
        e.preventDefault()
        if (!props.isDisabled) {
          router.push(`/arc20/${props.name}/mint`)
        }
      }}
    >
      Mint
    </Button>
  )
}

export default MintButton
