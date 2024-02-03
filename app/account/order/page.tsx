'use client'

import PaymentModal from '@/components/PaymentModal'
import { OrderStatus, OrderType } from '@/utils/constants'
import { useEndpoint } from '@/utils/request'
import {
  Tab,
  TabList,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'

// TODO 分页
function Page() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [currentOrder, setCurrentOrder] = useState<any>()
  const [type, setType] = useState<OrderType>()

  const { data: orders = [] } = useEndpoint('orders', {
    manual: false,
    params: { type },
  })

  return (
    <VStack align="flex-start" >
      <Tabs
        onChange={(index) => {
          setType(index === 0 ? undefined : index)
        }}
      >
        <TabList>
          <Tab>All</Tab>
          <Tab tabIndex={OrderType.InitDFT}>Deploy Token</Tab>
          <Tab tabIndex={OrderType.MintDFT}>Mint Token</Tab>
        </TabList>
      </Tabs>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Status</Th>
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
                  setCurrentOrder(order)
                  onOpen()
                }}
              >
                <Td>{order.id}</Td>
                <Td>{OrderStatus[order.status]}</Td>
                <Td>{new Date(order.createdAt).toLocaleString()}</Td>
                <Td>
                  <FaChevronRight />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <PaymentModal
        isOpen={isOpen}
        onClose={onClose}
        orderId={currentOrder?.id}
        status={currentOrder?.status}
        fees={currentOrder?.metadata?.fees}
        payAddress={currentOrder?.payAddress}
        satsbyte={currentOrder?.metadata?.satsbyte}
        remainTime={currentOrder?.expiredAt}
      />
    </VStack>
  )
}

export default Page
