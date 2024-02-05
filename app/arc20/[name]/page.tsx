import { request } from '@/utils/request'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Link,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react'
import { MdVerified } from 'react-icons/md'
import { GoUnverified } from 'react-icons/go'
import { MEMPOOL_URL } from '@/utils/constants'

async function Page({ params }: { params: { name: string } }) {
  const token = await request(`tokens/${params.name}`, {})
  const mintedAmount = token.mintCount * token.mintAmount
  const progress = (mintedAmount / token.supply) * 100
  const args = {
    time: new Date(token.deployedAt).valueOf(),
    max_mints: token.maxMints,
    mint_amount: token.mintAmount,
    mint_height: token.mintHeight,
    mint_bitworkc: token.bitworkc,
    request_ticker: token.name,
  }

  return (
    <Box px={20} mt={10} fontSize={16}>
      <HStack spacing={4} align="flex-start">
        <Box
          px={10}
          py={16}
          borderRadius={10}
          textTransform="uppercase"
          fontWeight="bold"
          bg="#000"
          shadow="0px 0px 10px 0px rgba(255, 255, 255, 0.5)"
        >
          {token.name}
        </Box>
        <VStack align="flex-start" py={2}>
          <HStack>
            <Heading textTransform="uppercase">{token.name}</Heading>
            <Flex ml={2}>
              {token.confirmed ? (
                <MdVerified color="green" />
              ) : (
                <GoUnverified color="red" />
              )}
              <Box
                fontSize={10}
                color={token.confirmed ? 'green' : 'red'}
                ml={1}
              >
                {token.confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}
              </Box>
            </Flex>
          </HStack>
          <Text color="gray.400">
            {token.metadata?.desc ?? token.metadata?.description}
          </Text>
        </VStack>
      </HStack>
      <VStack align="flex-start" spacing={6}>
        <HStack spacing={8} mt={8}>
          <VStack>
            <Box color="gray.400">Max Supply</Box>
            <Box>{token.supply}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Minted</Box>
            <Box>{mintedAmount}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Progress</Box>
            <Flex align="center">
              <Progress
                value={progress}
                colorScheme="green"
                size="sm"
                borderRadius={10}
                w={100}
              />
              <Box ml={1}>{progress.toFixed(2)}%</Box>
            </Flex>
          </VStack>
          <VStack>
            <Box color="gray.400">Holders</Box>
            <Box>{token.holders}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Deployed At</Box>
            <Box>{new Date(token.deployedAt).toLocaleString()}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Per Mint Amount</Box>
            <Box>{token.mintAmount}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Max Mints</Box>
            <Box>{token.maxMints}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Start Height</Box>
            <Box>{token.mintHeight}</Box>
          </VStack>
          <VStack>
            <Box color="gray.400">Bitworkc</Box>
            <Box>{token.bitworkc}</Box>
          </VStack>
        </HStack>
        <HStack align="flex-start" spacing={12}>
          <VStack align="flex-start" spacing={6}>
            <VStack align="flex-start">
              <Box color="gray.400">Atomical ID</Box>
              <Box>
                {token.commitTx}i{token.outputIndex}
              </Box>
            </VStack>
            <VStack align="flex-start">
              <Box color="gray.400">Deployer</Box>
              <Link
                href={`${MEMPOOL_URL}/address/${token.deployer}`}
                target="_blank"
              >
                {token.deployer}
              </Link>
            </VStack>
            <VStack align="flex-start">
              <Box color="gray.400">Commit TxID</Box>
              <Link
                href={`${MEMPOOL_URL}/tx/${token.commitTx}`}
                target="_blank"
              >
                {token.commitTx}
              </Link>
            </VStack>
            <VStack align="flex-start">
              <Box color="gray.400">Reveal TxID</Box>
              <Link
                href={`${MEMPOOL_URL}/tx/${token.revealTx}`}
                target="_blank"
              >
                {token.revealTx}
              </Link>
            </VStack>
          </VStack>
          <VStack align="flex-start">
            <Box color="gray.400">Args</Box>
            <Box
              as="pre"
              border="1px solid #000"
              bg="gray.800"
              borderRadius={10}
              p={4}
            >
              {JSON.stringify(args, null, 2)}
            </Box>
          </VStack>
        </HStack>
        {token.metadata?.legal?.terms && (
          <VStack align="flex-start">
            <Box color="gray.400">Legal Terms</Box>
            {token.metadata?.legal?.terms}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default Page
