import { request } from '@/utils/request'
import { Box, HStack, Link, VStack } from '@chakra-ui/react'
import { MEMPOOL_URL } from '@/utils/constants'
import NFTImage from './NFTImage'
import Panel from '@/components/Panel'

async function Page({ params }: { params: { tx: string } }) {
  const nft = await request(`nfts/${params.tx}`, {})

  return (
    <HStack w="max-content" m="auto" spacing={8} align="flex-start">
      <NFTImage {...nft} />
      <VStack align="flex-start" spacing="1px">
        <Box
          w="full"
          bg="gray.700"
          px={4}
          py={3}
          borderTopLeftRadius={10}
          borderTopRightRadius={10}
        >
          <Box color="gray.400" mb={2}>
            Atomical ID
          </Box>
          <Box>
            {nft.commitTx}i{nft.outputIndex}
          </Box>
        </Box>
        <Box w="full" bg="gray.700" px={4} py={3}>
          <Box color="gray.400" mb={2}>
            Atomical Number
          </Box>
          <Box>#{nft.index}</Box>
        </Box>
        <Box w="full" bg="gray.700" px={4} py={3}>
          <Box color="gray.400" mb={2}>
            Owner
          </Box>
          <Link href={`${MEMPOOL_URL}/address/${nft.owner}`} target="_blank">
            {nft.owner}
          </Link>
        </Box>
        <Box w="full" bg="gray.700" px={4} py={3}>
          <Box color="gray.400" mb={2}>Mint At</Box>
          <Box>{new Date(nft.mintAt).toLocaleString()}</Box>
        </Box>
        <Box w="full" bg="gray.700" px={4} py={3}>
          <Box color="gray.400" mb={2}>
            Commit TxID
          </Box>
          <Link href={`${MEMPOOL_URL}/tx/${nft.commitTx}`} target="_blank">
            {nft.commitTx}
          </Link>
        </Box>
        <Box
          w="full"
          bg="gray.700"
          px={4}
          py={3}
          borderBottomLeftRadius={10}
          borderBottomRightRadius={10}
        >
          <Box color="gray.400" mb={2}>
            Reveal TxID
          </Box>
          <Link href={`${MEMPOOL_URL}/tx/${nft.revealTx}`} target="_blank">
            {nft.revealTx}
          </Link>
        </Box>
      </VStack>
    </HStack>
  )
}

export default Page
