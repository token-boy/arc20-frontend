import { Box } from '@chakra-ui/react'

const Panel: ReactFC = (props) => {
  return (
    <Box bg="gray.700" borderRadius={10} px={8} py={6} w="max-content" m="auto">
      {props.children}
    </Box>
  )
}

export default Panel
