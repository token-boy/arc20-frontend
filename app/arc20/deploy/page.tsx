'use client'

import { useContext, useEffect, useState } from 'react'
import {
  Box,
  Button,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { FaCheck } from 'react-icons/fa'

import { GlobalContext } from '@/app/providers'
import { OrderStatus, UINT8_MAX, UINT_MAX } from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import { useRouter } from 'next/navigation'
import PaymentModal from '@/components/PaymentModal'
import FeeRateSelector from '@/components/FeeRateSelector'

export const bitworkcMap: Dict = {
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
  const [isTickerValid, setIsTickerValid] = useState<boolean>(false)
  const [remainTime, setRemainTime] = useState<number>()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const router = useRouter()

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

  const {
    run: initDFT,
    loading: initDFTIsLoading,
    data: initDFTResult,
  } = useEndpoint(`atomicals/init-dft`, {
    method: 'POST',
    onSuccess: (data) => {
      onOpen()
      setRemainTime(Date.now() + 1000 * 60 * 60 * 2)
      getOrder(undefined, { id: data?.orderId })
    },
  })

  const {
    run: mintFT,
    loading: mintFTIsLoading,
    data: mintFTResult,
  } = useEndpoint(`atomicals/mint-ft`, {
    method: 'POST',
    onSuccess: (data) => {
      onOpen()
      setRemainTime(Date.now() + 1000 * 60 * 60 * 2)
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
        router.push('/account/orders')
      } else {
        setTimeout(() => {
          getOrder(undefined, {
            id:
              mode === 'fair' ? initDFTResult?.orderId : mintFTResult?.orderId,
          })
        }, 1000 * 10)
      }
    },
  })

  return (
    <Box
      mt={4}
      bg="gray.700"
      px={8}
      py={6}
      w="max-content"
      m="auto"
      borderRadius={10}
    >
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
                    min: {
                      value: 546,
                      message: 'The minimum total supply is 546',
                    },
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
            w="full"
            onClick={handleSubmit(() => {
              setStep(2)
            })}
          >
            Next
          </Button>
        </VStack>
      )}

      {/* Step 2. */}
      {step === 2 && (
        <VStack w={620} bg="gray.700">
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
          <HStack mt={8} w="full" justify="center" px={8} spacing={8}>
            <Button variant="outline" flexGrow={1} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              flexGrow={4}
              isLoading={initDFTIsLoading || mintFTIsLoading}
              onClick={handleSubmit((payload) => {
                if (mode === 'fair') {
                  payload.totalSupply = payload.mintAmount * payload.maxMints
                  initDFT(payload)
                } else {
                  mintFT(payload)
                }
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

      <PaymentModal
        isOpen={isOpen}
        onClose={onClose}
        {...(mode === 'fair' ? initDFTResult : mintFTResult)}
        remainTime={remainTime}
      />
    </Box>
  )
}

export default Page
