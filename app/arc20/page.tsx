import { request } from '@/utils/request'
import {
  Flex,
  Progress,
  Box,
  Grid,
  GridItem,
  Divider,
  Input,
  Button,
} from '@chakra-ui/react'
import Link from 'next/link'

async function Page() {
  const tokens = await request(`tokens`, {})

  return (
    <Box px={8} mt={10}>
      <Flex justify="space-between" align="center">
        <Input
          placeholder="Search by name, txid, atomical id"
          w={360}
          size="sm"
        />
        <Link href="/arc20/deploy">
          <Button size="small" variant="primaryl" p={3} fontSize={12}>
            Deploy ARC20
          </Button>
        </Link>
      </Flex>
      <Grid templateColumns="1fr 1fr 2fr 1fr 1fr 1fr 1fr" px={2} mt={6}>
        <GridItem>#</GridItem>
        <GridItem>Name</GridItem>
        <GridItem>Progress</GridItem>
        <GridItem>Max Supply</GridItem>
        <GridItem>Minted</GridItem>
        <GridItem>Holders</GridItem>
        <GridItem>Bitworkc</GridItem>
      </Grid>
      <Divider mt={4} />

      {tokens.map((token: any) => {
        const mintedAmount = token.mintCount * token.mintAmount
        const progress = (mintedAmount / token.supply) * 100
        return (
          <Link key={token.id} href={`/arc20/${token.name}`}>
            <Grid
              templateColumns="1fr 1fr 2fr 1fr 1fr 1fr 1fr"
              px={2}
              py={6}
              _hover={{
                bg: 'gray.800',
              }}
            >
              <GridItem>{token.index}</GridItem>
              <GridItem textTransform="uppercase">{token.name}</GridItem>
              <GridItem>
                <Flex align="center">
                  <Progress
                    value={progress}
                    colorScheme="green"
                    size="sm"
                    borderRadius={10}
                    w={180}
                  />
                  <Box ml={1}>{progress.toFixed(2)}%</Box>
                </Flex>
              </GridItem>
              <GridItem>{token.supply}</GridItem>
              <GridItem>{token.mintCount * token.mintAmount}</GridItem>
              <GridItem>{token.holders}</GridItem>
              <GridItem>{token.bitworkc}</GridItem>
            </Grid>
          </Link>
        )
      })}
    </Box>
  )
}

export default Page
