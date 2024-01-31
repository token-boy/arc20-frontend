'use client'

import { useContext, useEffect, useState } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { FaCheck } from 'react-icons/fa'

import { GlobalContext, toast } from '@/app/providers'
import {
  MEMPOOL_URL,
  OrderStatus,
  UINT8_MAX,
  UINT_MAX,
} from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import CopyToClipboard from '@/components/CopyToClipboard'
import { satsToBTC } from '@/utils/functions'
import WalletConnector from '@/app/WalletConnector'
import { useCountDown } from 'ahooks'
import QRCode from '@/components/QRCode'
import { useRouter } from 'next/navigation'

const bitworkcMap: Dict = {
  '0000': {
    label: 'easy',
    timeSec: 64,
    timeFmt: '1 miunte',
  },
  '00000': {
    label: 'normal',
    timeSec: 1024,
    timeFmt: '16 minutes',
  },
  '000000': {
    label: 'hard',
    timeSec: 16384,
    timeFmt: '256 minutes',
  },
}

const feesMap: Dict = {
  fastestFee: {
    label: 'Fast',
    time: '10 minutes',
  },
  halfHourFee: {
    label: 'Average',
    time: '30 minutes',
  },
  hourFee: {
    label: 'Slow',
    time: '1 hour',
  },
  economyFee: {
    label: 'Economy',
    time: '30 minutes',
  },
}

// TODO more user friendly
function Page() {
  const { account } = useContext(GlobalContext)

  const [mode, setMode] = useState<'fair' | 'fixed'>('fair')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [feeRate, setFeeRate] = useState<string>('fastestFee')
  const [isTickerValid, setIsTickerValid] = useState<boolean>(false)
  const [targetDate, setTargetDate] = useState<number>()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const router = useRouter()

  const {
    data: fees,
    run: getFees,
    loading: loadingFees,
  } = useEndpoint(`${MEMPOOL_URL}/api/v1/fees/recommended`, {
    onSuccess: (data) => {
      setValue('satsbyte', data.halfHourFee)
      setFeeRate('halfHourFee')
    },
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
    getValues,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<{
    name: string
    mintAmount: number
    maxMints: number
    mintHeight: number
    description: string
    legalTerms: string
    bitworkc: string
    totalSupply: number
    address: string
    satsbyte: number
  }>({
    defaultValues: {
      description: '',
      legalTerms: '',
      bitworkc: '0000',
      name: 'MXSYA',
      mintAmount: 1000,
      maxMints: 21000,
      mintHeight: 0,
      totalSupply: 0,
      address: '',
      satsbyte: 0,
    },
  })

  const bitworkc = watch('bitworkc')
  const satsbyte = watch('satsbyte')

  useEffect(() => {
    if (account) {
      setValue('address', account.address)
    }
  }, [account])

  const [_, countDown] = useCountDown({
    targetDate,
  })

  const {
    run: initDft,
    loading: initDftIsLoading,
    data: initDftResult,
  } = useEndpoint(`atomicals/init-dft`, {
    method: 'POST',
    onSuccess: (data) => {
      onOpen()
      setTargetDate(Date.now() + 1000 * 60 * 60 * 2)
      getOrder(undefined, { id: data?.orderId })
    },
  })

  const { run: getTicker, loading: getTickerIsLoading } = useEndpoint(
    `atomicals/get-ticker`,
    {
      onSuccess: (data) => {
        if (data.result === null) {
          clearErrors('name')
          setIsTickerValid(true)
        } else {
          setError('name', {
            type: 'manual',
            message: 'This ticker has been deployed',
          })
          setIsTickerValid(false)
        }
      },
    }
  )

  const { run: getOrder } = useEndpoint('orders/:id', {
    onSuccess: (order) => {
      if (step === 3 || location.pathname !== '/arc20/deploy') {
        return
      }
      if (order.status === OrderStatus.Completed) {
        onClose()
        setStep(3)
      } else if (order.status === OrderStatus.Timeout) {
        onClose()
        router.push('/arc20/orders')
      } else {
        setTimeout(() => {
          getOrder(undefined, { id: initDftResult?.orderId })
        }, 1000 * 10)
      }
    },
  })

  return (
    <Flex justify="center">
      {/* Step 1. */}
      {step === 1 && (
        <VStack w={600} spacing={6}>
          <HStack spacing={10} cursor="pointer">
            <Box
              color={mode === 'fair' ? 'primaryl' : 'white'}
              _hover={{ color: 'primaryl' }}
              onClick={() => setMode('fair')}
            >
              Fair Mint
            </Box>
            <Box
              color={mode === 'fixed' ? 'primaryl' : 'white'}
              _hover={{ color: 'primaryl' }}
              onClick={() => setMode('fixed')}
            >
              Fixed Cap
            </Box>
          </HStack>
          <FormControl isRequired isInvalid={!!errors.name}>
            <FormLabel>Ticker</FormLabel>
            <InputGroup>
              <Input
                placeholder="Enter the name of the token"
                maxLength={64}
                {...register('name', {
                  required: 'This field is required',
                })}
                onBlur={() => {
                  const ticker = getValues('name')
                  if (!!ticker) {
                    getTicker(undefined, { ticker })
                  }
                }}
              />
              <InputRightElement>
                {getTickerIsLoading ? (
                  <Spinner />
                ) : isTickerValid ? (
                  <FaCheck color="green" />
                ) : null}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              {errors.name && (errors.name.message as string)}
            </FormErrorMessage>
          </FormControl>
          {mode === 'fair' && (
            <>
              <FormControl isRequired isInvalid={!!errors.mintAmount}>
                <FormLabel>Per Mint Amount</FormLabel>
                <NumberInput min={1} max={UINT_MAX}>
                  <NumberInputField
                    placeholder="1000"
                    {...register('mintAmount', {
                      required: 'This field is required',
                      valueAsNumber: true,
                    })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.mintAmount && (errors.mintAmount.message as string)}
                </FormErrorMessage>
                <FormHelperText>
                  Number of units of the token to award per successful mint.
                  Satoshi amount.
                </FormHelperText>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.maxMints}>
                <FormLabel>Max Mints</FormLabel>
                <NumberInput min={1} max={UINT_MAX}>
                  <NumberInputField
                    placeholder="21000"
                    {...register('maxMints', {
                      required: 'This field is required',
                      valueAsNumber: true,
                    })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.maxMints && (errors.maxMints.message as string)}
                </FormErrorMessage>
                <FormHelperText>
                  Total number of permitted mints before exhausting the quota
                  and becoming &quot;fully minted&quot;
                </FormHelperText>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.mintHeight}>
                <FormLabel>Start Height</FormLabel>
                <NumberInput min={0} max={UINT_MAX}>
                  <NumberInputField
                    placeholder="0"
                    {...register('mintHeight', {
                      required: 'This field is required',
                      valueAsNumber: true,
                    })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.mintHeight && (errors.mintHeight.message as string)}
                </FormErrorMessage>
                <FormHelperText>
                  Starting block height that mints may be begin. Can set block
                  height to 0 or any future block height.
                </FormHelperText>
              </FormControl>
            </>
          )}
          {mode === 'fixed' && (
            <FormControl isRequired isInvalid={!!errors.totalSupply}>
              <FormLabel>Total Supply</FormLabel>
              <NumberInput min={1} max={UINT8_MAX}>
                <NumberInputField
                  placeholder="21000000"
                  {...register('totalSupply', {
                    required: 'This field is required',
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>
                {errors.totalSupply && (errors.totalSupply.message as string)}
              </FormErrorMessage>
              <FormHelperText>
                Total supply units to directly mint
              </FormHelperText>
            </FormControl>
          )}
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Maximum supported is 512 characters"
              maxLength={512}
              {...register('description')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Legal Terms</FormLabel>
            <Textarea
              placeholder="Maximum supported is 2048 characters"
              maxLength={2048}
              {...register('legalTerms')}
            />
          </FormControl>

          {mode === 'fair' && (
            <FormControl isRequired isInvalid={!!errors.bitworkc}>
              <FormLabel>Mint Bitworkc</FormLabel>
              <RadioGroup
                my={3}
                value={bitworkc}
                onChange={(value) => setValue('bitworkc', value)}
              >
                <HStack spacing={4}>
                  {Object.keys(bitworkcMap).map((bitworkc) => (
                    <Radio key={bitworkc} value={bitworkc}>
                      {bitworkcMap[bitworkc].label}
                    </Radio>
                  ))}
                </HStack>
              </RadioGroup>
              <FormHelperText>
                The prefix is: {bitworkc}; will take about{' '}
                {bitworkcMap[bitworkc].timeFmt} to mine.
              </FormHelperText>
              {/* TODO  add advanced bitwork setting  */}
              {/* <Input
                placeholder="Example: 0000, abcd"
                maxLength={64}
                {...register('bitworkc', {
                  required: 'This field is required',
                  minLength: {
                    value: 4,
                    message: 'The minimum length is 4',
                  },
                })}
              /> */}
              {/* <FormErrorMessage>
                {errors.bitworkc && (errors.bitworkc.message as string)}
              </FormErrorMessage> */}
              <FormHelperText textAlign="justify">
                Define an optional Bitwork mining prefix target for the mints.
                If set, then the minters must expend CPU energy to find a match
                for the prefix target to be allowed to mint successfully. This
                forces minters to perform proof of working mining in a similar
                manner to Bitcoin mining itself.
              </FormHelperText>
              {/* <FormHelperText textAlign="justify">
                It is recommended to choose a prefix between 4 and 6 hex digits.
                You can use any valid hex digits between a-f0-9. It is intended
                to purely be a vanity transaction id and any value is sufficient
                to require minters to expend energy to mint the token.
              </FormHelperText>
              <FormHelperText>
                Example time estimates for time required for minters:
              </FormHelperText>
              <FormHelperText>
                Note: it could be any digit in the range a-f0-9, we use all
                7&apos;s for illustration purpose only.
              </FormHelperText>
              <FormHelperText>
                <Box as="ul" ml={4}>
                  <li>
                    3 hex digit prefix of &quot;777&quot; will take about 4
                    seconds to mine
                  </li>
                  <li>
                    4 hex digit prefix of &quot;7777&quot; will take about 1
                    minute to mine
                  </li>
                  <li>
                    5 hex digit prefix of &quot;77777&quot; will take about 16
                    minutes to mine
                  </li>
                  <li>
                    6 hex digit prefix of &quot;777777&quot; will take about 256
                    minutes to mine
                  </li>
                </Box>
              </FormHelperText> */}
            </FormControl>
          )}

          <Button
            size="lg"
            mt={8}
            mb={12}
            w="full"
            onClick={handleSubmit(() => {
              getFees()
              setStep(2)
            })}
          >
            Next
          </Button>
        </VStack>
      )}

      {/* Step 2. */}
      {step === 2 && (
        <VStack w={620}>
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
          {loadingFees && (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              mt={10}
            />
          )}
          {fees && (
            <HStack spacing={10} mt={4} w={600} wrap="wrap">
              {Object.keys(feesMap).map((fee) => (
                <VStack
                  key={fee}
                  spacing={1}
                  px={10}
                  py={2}
                  border="2px solid"
                  borderColor={feeRate === fee ? 'primaryl' : 'gray.600'}
                  _hover={{ borderColor: 'primaryl' }}
                  cursor="pointer"
                  borderRadius={8}
                  bg="gray.800"
                  onClick={() => {
                    setFeeRate(fee)
                    setValue('satsbyte', fees[fee])
                  }}
                >
                  <Box>{feesMap[fee].label}</Box>
                  <HStack spacing={1}>
                    <Box fontSize={18} color="primaryr">
                      {fees[fee]}
                    </Box>
                    <Box>sats/vB</Box>
                  </HStack>
                  <Box fontSize={12} fontStyle="italic">
                    ~ {feesMap[fee].time}
                  </Box>
                </VStack>
              ))}
              <VStack
                spacing={1}
                px={10}
                py={2}
                border="2px solid"
                borderColor={feeRate === 'custom' ? 'primaryl' : 'gray.600'}
                _hover={{ borderColor: 'primaryl' }}
                cursor="pointer"
                borderRadius={8}
                bg="gray.800"
                onClick={() => {
                  setFeeRate('custom')
                  setValue('satsbyte', fees.minimumFee)
                }}
              >
                <Box>Custom</Box>
                <HStack spacing={1}>
                  <Box fontSize={18} color="primaryr">
                    {satsbyte}
                  </Box>
                  <Box>sats/vB</Box>
                </HStack>
                <Slider
                  min={fees.minimumFee}
                  defaultValue={fees.minimumFee}
                  max={500}
                  step={1}
                  w={300}
                  onChange={(value) => {
                    setValue('satsbyte', value)
                  }}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </VStack>
            </HStack>
          )}
          <HStack mt={8} w="full" justify="center" px={8} spacing={8}>
            <Button variant="outline" flexGrow={1} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              flexGrow={4}
              isLoading={initDftIsLoading}
              onClick={handleSubmit((payload) => {
                if (mode === 'fair') {
                  payload.totalSupply = payload.mintAmount * payload.maxMints
                }
                initDft(payload)
              })}
            >
              Submit
            </Button>
          </HStack>
        </VStack>
      )}

      {/* Step 3. */}
      {step === 3 && (
        <VStack mt={10}>
          <Heading>Deploy ARC20 Token Successful !</Heading>
          <Text mt={5} fontSize={18}>
            Note: It's may take a few minutes for the token to be indexed, and
            it will take 3 block confirmations before the token will be minted.
          </Text>
          <Text color="gray.400"></Text>
        </VStack>
      )}

      {/* TODO show USD price */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth={700}>
          <ModalHeader>Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack mb={4} color="gray.400">
              <CopyToClipboard text={initDftResult?.orderId}>
                <Text fontSize={14}>OrderId: {initDftResult?.orderId}</Text>
              </CopyToClipboard>
              <HStack spacing={4} fontSize={12}>
                <Flex align="center">
                  <Text>Fee Rate: {satsbyte} </Text>
                  <Text color="gray.400" ml={1}>
                    sats/vB
                  </Text>
                </Flex>
                <Text>Status: {initDftResult?.status}</Text>
              </HStack>
            </VStack>
            <VStack align="flex-start" spacing={3}>
              <Flex justify="space-between" w="full">
                <Text color="gray.300" fontSize={14}>
                  Sats in atomical:
                </Text>
                <HStack spacing={1}>
                  <Text>
                    {(initDftResult?.fees.commitAndRevealFeePlusOutputs ?? 0) -
                      (initDftResult?.fees.commitAndRevealFee ?? 0)}
                  </Text>
                  <Text color="gray.400">sats</Text>
                </HStack>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text color="gray.300" fontSize={14}>
                  Network Fee:
                </Text>
                <HStack spacing={1}>
                  <Text>{initDftResult?.fees.commitAndRevealFee}</Text>
                  <Text color="gray.400">sats</Text>
                </HStack>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text color="gray.300" fontSize={14}>
                  Service Fee:
                </Text>
                <Text color="green">Free</Text>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text>Total Amount:</Text>
                <HStack spacing={1}>
                  <CopyToClipboard
                    text={satsToBTC(
                      initDftResult?.fees.commitAndRevealFeePlusOutputs
                    )}
                  >
                    <Text>
                      {satsToBTC(
                        initDftResult?.fees.commitAndRevealFeePlusOutputs
                      )}
                    </Text>
                  </CopyToClipboard>
                  <Text color="gray.400">BTC</Text>
                </HStack>
              </Flex>
            </VStack>
            <Divider my={3} />

            <Accordion
              allowToggle
              bg="gray.700"
              borderRadius={8}
              display={initDftResult?.status === 'pending' ? 'block' : 'none'}
            >
              <AccordionItem border="none">
                <AccordionButton py={3}>
                  <Box as="span" flex="1" textAlign="left">
                    Pay with BTC
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack justify="center">
                    <Text color="gray.400" fontSize={14}>
                      Scan the QRCode to pay:
                    </Text>
                    <QRCode text={initDftResult?.payAddress} />
                    <Text color="gray.400" fontSize={14} mt={6}>
                      Or pay to the address below:
                    </Text>
                    <CopyToClipboard text={initDftResult?.payAddress}>
                      <Text>{initDftResult?.payAddress}</Text>
                    </CopyToClipboard>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem border="none">
                <AccordionButton py={3}>
                  <Box as="span" flex="1" textAlign="left">
                    Pay with Wallet
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack>
                    {account ? (
                      <Button>Pay with Wallet</Button>
                    ) : (
                      <WalletConnector>
                        <Button>Connect Wallet To Pay</Button>
                      </WalletConnector>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Text mt={6} mb={3} color="gray.400" fontSize={14}>
              Remain time: {countDown.hours} hours {countDown.minutes} minutes{' '}
              {countDown.seconds} seconds
            </Text>
            <Text color="gray.400" fontSize={14}>
              You can find this order{' '}
              <Link textDecoration="underline" href="/arc20/order">
                here
              </Link>
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default Page
