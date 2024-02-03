'use client'

import { useContext, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  VStack,
  useDisclosure,
  Heading,
  HStack,
  Text,
  Link,
  Spinner,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'

import { GlobalContext } from '@/app/providers'
import { OrderStatus } from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import FeeRateSelector from '@/components/FeeRateSelector'
import PaymentModal from '@/components/PaymentModal'
import { bitworkcMap } from '../../deploy/page'
import { FaPlay, FaPause } from 'react-icons/fa'

let sequence = 0

function Page() {
  const { account } = useContext(GlobalContext)

  const { name: tokenName } = useParams()
  const searchParams = useSearchParams()

  const [orderId, setOrderId] = useState(searchParams.get('orderId') as string)
  const [remainTime, setRemainTime] = useState<number>()
  const [worker, setWorker] = useState<Worker>()
  const [miningStatus, setMiningStatus] = useState<'runing' | 'paused'>(
    orderId ? 'paused' : 'runing'
  )

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
  } = useForm<{
    name: string
    address: string
    satsbyte: number
  }>({
    defaultValues: {
      satsbyte: 0,
    },
  })

  const satsbyte = watch('satsbyte')

  useEffect(() => {
    if (account) {
      setValue('address', account.address)
    }
  }, [account])

  const {
    run: mintDFT,
    loading: mintDFTIsLoading,
    data: mintDFTResult,
  } = useEndpoint(`atomicals/mint-dft`, {
    method: 'POST',
    onSuccess: (data) => {
      onOpen()
      setRemainTime(Date.now() + 1000 * 60 * 60 * 2)
      getOrder(undefined, { id: data.orderId })
      setOrderId(data.orderId)
    },
  })

  const { data: token } = useEndpoint(`tokens/${tokenName}`, {
    manual: false,
    onSuccess(data) {
      setValue('name', data.name)
    },
  })

  const { run: finishMining } = useEndpoint('mining/finish', {
    method: 'POST',
    onSuccess: () => {
      localStorage.removeItem(`mining:${orderId}`)
      setStep(3)
    },
  })

  const runWorker = (data: any) => {
    const worker = new Worker('/miner-worker.js')
    setWorker(worker)

    worker.postMessage({
      action: 'init',
    })

    worker.onmessage = (e) => {
      const { type } = e.data
      if (type === 'inited') {
        const localSeqStart = parseInt(
          localStorage.getItem(`mining:${orderId}`) ?? ''
        )
        worker.postMessage({
          action: 'run',
          params: {
            ...data,
            seqStart: localSeqStart || 0,
            seqEnd: 0xffffffff,
          },
        })
      } else if (type === 'foundSolution') {
        // console.log('found solution', e.data.result)
        finishMining({
          orderId: orderId,
          sequence: e.data.result.sequence,
        })
      } else {
        sequence = e.data.sequence
        // console.log(sequence)
      }
    }
  }

  const { run: getMining, data: miningData } = useEndpoint(`mining`, {
    onSuccess: (data) => {
      if (miningStatus === 'runing') {
        runWorker(data)
      }
    },
  })

  const { run: getOrder } = useEndpoint('orders/:id', {
    onSuccess: (order) => {
      if (location.pathname !== `/arc20/${tokenName}/mint`) {
        return
      }
      if (order.status === OrderStatus.WaitForMining) {
        getMining(undefined, { orderId: order.id })
      } else if (order.status === OrderStatus.Completed) {
        setStep(3)
      } else if (order.status === OrderStatus.Pending) {
        setTimeout(() => {
          getOrder(undefined, { id: order.id })
        }, 1000 * 10)
      }
    },
  })

  const [step, setStep] = useState<number>(() => {
    const step = parseInt(searchParams.get('step') as string) || 1
    if (step === 2) {
      getOrder(undefined, { id: orderId })
    }
    return step
  })

  return (
    <Flex justify="center">
      <VStack bg="gray.700" p={10} borderRadius={10} mt={10}>
        <Heading>Mint {tokenName}</Heading>
        {/* Step 1. */}
        {step === 1 && (
          <>
            <FormControl isRequired isInvalid={!!errors.address}>
              <FormLabel>Receive Address</FormLabel>
              <Input
                placeholder="Provide the address to receive the minted tokens"
                maxLength={64}
                {...register('address', {
                  required: 'Please input receive address',
                })}
              />
              <FormErrorMessage>
                {errors.address && (errors.address.message as string)}
              </FormErrorMessage>
            </FormControl>
            <FeeRateSelector
              value={satsbyte}
              onChange={(value) => {
                setValue('satsbyte', value)
              }}
            />
            <Button
              flexGrow={4}
              isLoading={mintDFTIsLoading}
              w="80%"
              mt={8}
              onClick={handleSubmit((payload) => {
                mintDFT(payload)
              })}
            >
              Submit
            </Button>
          </>
        )}

        {/* Step 2. */}
        {step === 2 && (
          <VStack spacing={6} mt={4}>
            <HStack spacing={5} color="gray.400">
              <Text>Mint Amount: {token?.mintAmount}</Text>
              <Text>
                Difficulty:{' '}
                {bitworkcMap[token?.bitworkc]?.label ??
                  token?.bitworkc ??
                  '...'}
              </Text>
            </HStack>
            <HStack>
              {miningStatus === 'runing' && <Spinner />}
              <Box>
                <Heading fontSize={20}>
                  {miningStatus === 'runing' ? 'Mining...' : 'Paused'}
                </Heading>
              </Box>
            </HStack>
            <Button
              variant="outline"
              size="xs"
              p={4}
              onClick={() => {
                if (miningStatus === 'runing') {
                  worker?.terminate()
                  setWorker(undefined)
                  localStorage.setItem(`mining:${orderId}`, sequence.toString())
                  setMiningStatus('paused')
                } else {
                  runWorker(miningData)
                  setMiningStatus('runing')
                }
              }}
            >
              {miningStatus === 'runing' ? <FaPause /> : <FaPlay />}
            </Button>
            <Text color="gray.400" w={500}>
              Note: you can pause mining at any time, no loss of work progress,
              and you can find all the unfinished tasks{' '}
              <Link href="/account/orders" textDecoration="underline">
                here
              </Link>
            </Text>
          </VStack>
        )}

        {/* Step 3. */}
        {step === 3 && (
          <>
            <Text fontSize={20} mt={4}>
              Mint Success!
            </Text>
            <Text color="gray.400" w={500} mt={4}>
              Please check your balance in a wallet that supports the Atomical
              protocol
            </Text>
          </>
        )}
      </VStack>
      <PaymentModal
        isOpen={isOpen}
        onClose={onClose}
        {...mintDFTResult}
        remainTime={remainTime}
      />
    </Flex>
  )
}

export default Page
