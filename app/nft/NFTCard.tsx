'use client'

import { useState } from 'react'
import { Image, Link, Text, VStack } from '@chakra-ui/react'
import { useMount } from 'ahooks'

export function hexStringToImageUrl(name: string, str: string = '') {
  let mineType = 'image/*'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    mineType = 'image/jpeg'
  } else if (name.endsWith('.png')) {
    mineType = 'image/png'
  } else if (name.endsWith('.webp')) {
    mineType = 'image/webp'
  } else if (name.endsWith('.svg')) {
    mineType = 'image/svg+xml'
  }

  const buffer = new Uint8Array(
    str.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  )
  const blob = new Blob([buffer], { type: mineType! })
  const imageUrl = URL.createObjectURL(blob)
  return imageUrl
}

const NFTCard: React.FC = (props: any) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  useMount(() => {
    setImageUrl(hexStringToImageUrl(props.name, props.metadata[props.name]?.$d))
  })

  return (
    <Link
      display={imageUrl ? 'block' : 'none'}
      border="1px solid #5C5C5C"
      borderRadius={10}
      p={5}
      pb={0}
      bg="gray.800"
      cursor="pointer"
      _hover={{ bg: 'gray.700' }}
      href={`/nft/${props.commitTx}`}
    >
      <VStack>
        <Image
          src={imageUrl}
          w={32}
          h={32}
          alt={props.name}
          borderRadius={10}
          onError={() => {
            setImageUrl(undefined)
          }}
        />
        <Text mt={2} pb={3} fontSize={16}>#{props.index}</Text>
      </VStack>
    </Link>
  )
}

export default NFTCard
