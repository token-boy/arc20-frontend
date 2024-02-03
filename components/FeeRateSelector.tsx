import { MEMPOOL_URL } from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import {
  Box,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'

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

const FeeRateSelector: React.FC<{
  value: number
  onChange: (fee: number) => void
}> = ({ value, onChange }) => {
  const [feeRate, setFeeRate] = useState<string>('fastestFee')

  const { data: fees, loading } = useEndpoint(
    `${MEMPOOL_URL}/api/v1/fees/recommended`,
    {
      manual: false,
      onSuccess: (data) => {
        // setValue('satsbyte', data.halfHourFee)
        setFeeRate('halfHourFee')
      },
    }
  )

  return (
    <>
      {loading && (
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
                onChange(fees[fee])
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
              onChange(fees.minimumFee)
            }}
          >
            <Box>Custom</Box>
            <HStack spacing={1}>
              <Box fontSize={18} color="primaryr">
                {value}
              </Box>
              <Box>sats/vB</Box>
            </HStack>
            <Slider
              min={fees.minimumFee}
              defaultValue={fees.minimumFee}
              max={500}
              step={1}
              w={300}
              onChange={onChange}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </VStack>
        </HStack>
      )}
    </>
  )
}

export default FeeRateSelector
