import { toast } from '@/app/providers'
import { HStack } from '@chakra-ui/react'
import { LuCopy } from 'react-icons/lu'

const CopyToClipboard: React.FC<{
  text?: string | number
  children: React.ReactNode
}> = (props) => {
  return (
    <HStack>
      {props.children}
      <LuCopy
        style={{ cursor: 'pointer' }}
        onClick={() => {
          navigator.clipboard.writeText(String(props.text))
          toast({
            title: 'Copied',
            status: 'success',
          })
        }}
      />
    </HStack>
  )
}

export default CopyToClipboard
