'use client'

import { useState } from 'react'
import { Box, Image, Link, Text, VStack } from '@chakra-ui/react'
import { useMount } from 'ahooks'
import { hexStringToImageUrl } from '../NFTCard'

const NFTImage: React.FC = (props: any) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  useMount(() => {
    setImageUrl(hexStringToImageUrl(props.name, props.metadata[props.name]?.$d))
  })

  return (
    <Box
      display={imageUrl ? 'block' : 'none'}
      borderRadius={10}
      p={5}
      bg="gray.800"
    >
      <Image
        src={imageUrl}
        w={64}
        alt={props.name}
        borderRadius={10}
        onError={() => {
          setImageUrl(undefined)
        }}
      />
    </Box>
  )
}

export default NFTImage
