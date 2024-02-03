'use client'

import PaymentModal from '@/components/PaymentModal'
import { OrderStatus, OrderType } from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableCaption,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'

// TODO 分页
function Page() {
  const [type, setType] = useState<OrderType>()

  const router = useRouter()

  const { data: orders = [] } = useEndpoint('orders', {
    manual: false,
    params: { type, status: OrderStatus.WaitForMining },
  })

  return (
    <VStack align="flex-start">
      <Tabs
        onChange={(index) => {
          setType(index === 0 ? undefined : index)
        }}
      >
        <TabList>
          <Tab>All</Tab>
          <Tab tabIndex={OrderType.InitDFT}>Mint Token</Tab>
        </TabList>
      </Tabs>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Date</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order: any) => (
              <Tr
                key={order.id}
                cursor="pointer"
                _hover={{
                  bg: 'gray.800',
                }}
                onClick={() => {
                  router.push(
                    `/arc20/${order.metadata.atomPayload.args.mint_ticker}/mint?step=2&orderId=${order.id}`
                  )
                }}
              >
                <Td>{order.id}</Td>
                <Td>{new Date(order.createdAt).toLocaleString()}</Td>
                <Td>
                  <FaChevronRight />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  )
}

export default Page
