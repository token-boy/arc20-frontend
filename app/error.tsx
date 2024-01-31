'use client' // Error components must be Client Components

import Link from 'next/link'
import { Box, Button, Heading } from '@chakra-ui/react'

function Error() {
  return (
    <Box textAlign="center" mt={40}>
      <Heading as="h2">Something went wrong!</Heading>
      <Link href="/">
        <Button variant="outline" mt={10}>
          Go Home
        </Button>
      </Link>
    </Box>
  )
}

export default Error
