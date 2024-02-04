'use client'

import { useContext, useEffect, useState } from 'react'
import router from 'next/router'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react'

import FeeRateSelector from '@/components/FeeRateSelector'
import Panel from '@/components/Panel'
import PaymentModal from '@/components/PaymentModal'
import Upload, { FileItem } from '@/components/Upload'
import { OrderStatus } from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import { GlobalContext } from '@/app/providers'

function Page() {
  const { account } = useContext(GlobalContext)

  const [items, setItems] = useState<FileItem[]>([])
  const [satsbyte, setSatsbyte] = useState<number>(0)
  const [address, setAddress] = useState<string>(account?.address ?? '')
  const [remainTime, setRemainTime] = useState<number>()
  const [isSubmited, setIsSubmited] = useState<boolean>(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    run: mintNFT,
    loading: mintNFTIsLoading,
    data: mintNFTResult,
  } = useEndpoint('atomicals/mint-nft', {
    method: 'POST',
    onSuccess: (data) => {
      onOpen()
      setRemainTime(Date.now() + 1000 * 60 * 60 * 2)
      getOrder(undefined, { id: data?.orderId })
      setIsSubmited(true)
    },
  })

  const { run: getOrder, data: order } = useEndpoint('orders/:id', {
    onSuccess: (order) => {
      if (location.pathname !== '/nft/mint') {
        return
      }
      if (order.status === OrderStatus.Completed) {
        onClose()
      } else if (order.status === OrderStatus.Timeout) {
        onClose()
        router.push('/account/orders')
      } else {
        setTimeout(() => {
          getOrder(undefined, {
            id: mintNFTResult?.orderId,
          })
        }, 1000 * 10)
      }
    },
  })

  useEffect(() => {
    if (account) {
      setAddress(account.address)
    }
  }, [account])

  return (
    <Panel>
      <Upload onChange={setItems} />
      <FormControl isRequired mt={8} mb={6}>
        <FormLabel>Receive Address</FormLabel>
        <Input
          placeholder="Provide the address to receive the minted tokens"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
          }}
          maxLength={64}
        />
      </FormControl>
      <FeeRateSelector value={satsbyte} onChange={setSatsbyte} />
      <PaymentModal
        isOpen={isOpen}
        onClose={onClose}
        {...mintNFTResult}
        remainTime={remainTime}
      />
      <Button
        w="full"
        mt={8}
        isLoading={mintNFTIsLoading || order?.status === OrderStatus.Pending}
        isDisabled={!items.length || !satsbyte || !address || isSubmited}
        onClick={() => {
          mintNFT({
            name: items[0].name,
            data: items[0].data,
            address: address,
            satsbyte: satsbyte,
          })
        }}
      >
        Submit
      </Button>
    </Panel>
  )
}

export default Page
