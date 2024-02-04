'use client'

import { useRef, useState } from 'react'
import {
  Box,
  Center,
  CloseButton,
  Flex,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaCloudUploadAlt } from 'react-icons/fa'

import { toast } from '@/app/providers'
import Script from 'next/script'

const MAX_SIZE = 365 * 1024

export interface FileItem {
  name: string
  type: string
  size: number
  data: string
}

// TODO multiple
const Upload: React.FC<{
  onChange: (items: FileItem[]) => void
  name?: string
}> = ({ onChange }) => {
  const ref = useRef<HTMLInputElement>(null)
  // files
  const [items, setItems] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>()
  const [isDragOvering, setIsGragOvering] = useState<boolean>()

  const processFile = async (file: File) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        setIsLoading(true)

        if (file.type === 'image/webp' || file.type === 'image/svg+xml') {
          if (file.size > MAX_SIZE) {
            toast({
              title: 'The compressed size of the image exceed 365kb',
              status: 'error',
            })
            return
          }
          const item = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string,
          }
          onChange([item])
          setItems([item])
        }

        const img = document.createElement('img')
        img.src = reader.result as string
        await new Promise((resolve) => (img.onload = resolve))
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const rawImageData = ctx.getImageData(0, 0, img.width, img.height)

        const webpBuffer = await window.encodeWebp(rawImageData)
        console.log(webpBuffer.byteLength);
        
        if (webpBuffer.byteLength > MAX_SIZE) {
          toast({
            title: 'The compressed size of the image exceed 365kb',
            status: 'error',
          })
          return
        }

        const uint8Array = new Uint8Array(webpBuffer)
        const base64String = btoa(
          String.fromCharCode.apply(null, Array.from(uint8Array))
        )
        const dataUrl = 'data:image/webp;base64,' + base64String

        const item = {
          name: file.name,
          type: file.type,
          size: webpBuffer.byteLength,
          data: dataUrl,
        }
        onChange([item])
        setItems([item])
      } catch (error: any) {
        toast({
          title: error.message,
          status: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Box minW={500} minH={150}>
      <Script src="/webp.js" type="module"></Script>
      <input
        type="file"
        ref={ref}
        // multiple
        style={{ display: 'none' }}
        accept="image/jpeg, image/png, image/webp, image/svg+xml"
        onChange={(e) => {
          processFile(e.target.files![0])
        }}
      />
      <Center h={150} position="relative">
        <Box
          position="absolute"
          left={0}
          right={0}
          top={0}
          bottom={0}
          shadow="base"
          borderRadius={10}
          cursor="pointer"
          borderWidth={1}
          borderStyle="dashed"
          borderColor={isDragOvering ? '#999' : '#666'}
          _hover={{ borderColor: '#999' }}
          onClick={() => {
            if (isLoading) return
            ref.current?.click()
          }}
          onDragEnter={() => {
            setIsGragOvering(true)
          }}
          onDragLeave={() => {
            setIsGragOvering(false)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={(e) => {
            e.preventDefault()
            processFile(e.dataTransfer.files[0])
          }}
        ></Box>
        {!isLoading && (
          <HStack spacing={6}>
            <FaCloudUploadAlt size={80} />
            <VStack>
              <Text>Support .jpg, .png, .webp, .svg</Text>
              <Text fontSize={12} color="gray.400">
                The compressed size of the image should be less than 365kb
              </Text>
            </VStack>
          </HStack>
        )}
        {isLoading && <Spinner />}
      </Center>
      {items.map((item, index) => (
        <Flex
          justify="space-between"
          mt={5}
          bg="gray.800"
          px={4}
          py={2}
          borderRadius={10}
          key={index}
        >
          <HStack>
            <Image
              src={item.data}
              alt={item.name}
              w={10}
              h={10}
            />
            <Text>{item.name}</Text>
          </HStack>
          <HStack>
            <Text>{(item.size / 1024).toFixed(2)}kb</Text>
            <CloseButton
              onClick={() => {
                const newItems = items.filter((_, i) => i !== index)
                onChange(newItems)
                setItems(newItems)
              }}
            />
          </HStack>
        </Flex>
      ))}
    </Box>
  )
}

export default Upload
