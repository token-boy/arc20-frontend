import { request } from '@/utils/request'
import { Box, Button, Flex, HStack, Input } from '@chakra-ui/react'
import Link from 'next/link'
import NFTCard from './NFTCard'

async function Page() {
  const nfts = await request('nfts')

  return (
    <Box px={10}>
      <Flex justify="space-between" align="center">
        <Input
          placeholder="Search by name, txid, atomical id"
          w={360}
          size="sm"
        />
        <Link href="/nft/mint">
          <Button size="small" variant="primaryl" p={3} fontSize={12}>
            Mint NFT
          </Button>
        </Link>
      </Flex>
      <HStack spacing={5} mt={6} wrap="wrap">
        {nfts.map((nft: any, index: number) => (
          <NFTCard {...nft} key={index} />
        ))}
      </HStack>
    </Box>
  )
}

export default Page
