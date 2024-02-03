import { useContext } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  HStack,
  Flex,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Button,
  Text,
  Box,
  Link,
} from '@chakra-ui/react'
import { useCountDown } from 'ahooks'

import { GlobalContext } from '@/app/providers'
import { satsToBTC } from '@/utils/functions'
import { OrderStatus } from '@/utils/constants'

import CopyToClipboard from './CopyToClipboard'
import QRCode from './QRCode'
import WalletConnector from './WalletConnector'
import { useWallets } from '@/utils/wallet'

const PaymentModal: React.FC<{
  isOpen: boolean
  onClose: VoidFunction
  orderId?: string
  satsbyte?: number
  status?: OrderStatus
  fees?: any
  payAddress?: string
  remainTime?: number | string
}> = (props) => {
  const { account } = useContext(GlobalContext)

  const [_, countDown] = useCountDown({
    targetDate: props.remainTime,
  })

  const wallets = useWallets()

  /* TODO show USD price */
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent minWidth={700}>
        <ModalHeader>Payment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack mb={4} color="gray.400">
            <CopyToClipboard text={props.orderId}>
              <Text fontSize={14}>OrderId: {props.orderId}</Text>
            </CopyToClipboard>
            <HStack spacing={4} fontSize={12}>
              <Flex align="center">
                <Text>Fee Rate: {props.satsbyte} </Text>
                <Text color="gray.400" ml={1}>
                  sats/vB
                </Text>
              </Flex>
              {props.status && <Text>Status: {OrderStatus[props.status]}</Text>}
            </HStack>
          </VStack>
          <VStack align="flex-start" spacing={3}>
            <Flex justify="space-between" w="full">
              <Text color="gray.300" fontSize={14}>
                Sats in atomical:
              </Text>
              <HStack spacing={1}>
                <Text>
                  {(props.fees?.commitAndRevealFeePlusOutputs ?? 0) -
                    (props.fees?.commitAndRevealFee ?? 0)}
                </Text>
                <Text color="gray.400">sats</Text>
              </HStack>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text color="gray.300" fontSize={14}>
                Network Fee:
              </Text>
              <HStack spacing={1}>
                <Text>{props.fees?.commitAndRevealFee}</Text>
                <Text color="gray.400">sats</Text>
              </HStack>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text color="gray.300" fontSize={14}>
                Service Fee:
              </Text>
              <Text color="green">Free</Text>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text>Total Amount:</Text>
              <HStack spacing={1}>
                <CopyToClipboard
                  text={satsToBTC(props.fees?.commitAndRevealFeePlusOutputs)}
                >
                  <Text>
                    {satsToBTC(props.fees?.commitAndRevealFeePlusOutputs)}
                  </Text>
                </CopyToClipboard>
                <Text color="gray.400">BTC</Text>
              </HStack>
            </Flex>
          </VStack>
          {props.status === OrderStatus.Pending && (
            <>
              <Divider my={3} />
              <Accordion
                allowToggle
                bg="gray.700"
                borderRadius={8}
                display={
                  props?.status === OrderStatus.Pending ? 'block' : 'none'
                }
              >
                <AccordionItem border="none">
                  <AccordionButton py={3}>
                    <Box as="span" flex="1" textAlign="left">
                      Pay with BTC
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack justify="center">
                      <Text color="gray.400" fontSize={14}>
                        Scan the QRCode to pay:
                      </Text>
                      <QRCode text={props.payAddress} />
                      <Text color="gray.400" fontSize={14} mt={6}>
                        Or pay to the address below:
                      </Text>
                      <CopyToClipboard text={props?.payAddress}>
                        <Text>{props.payAddress}</Text>
                      </CopyToClipboard>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem border="none">
                  <AccordionButton py={3}>
                    <Box as="span" flex="1" textAlign="left">
                      Pay with Wallet
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack>
                      {account ? (
                        <Button
                          onClick={async () => {
                            const wallet = wallets[account.provider.name]
                            await wallet.sendBitcoin(
                              props.payAddress!,
                              props.fees.commitAndRevealFeePlusOutputs
                            )
                          }}
                        >
                          Pay with Wallet
                        </Button>
                      ) : (
                        <WalletConnector>
                          <Button>Connect Wallet To Pay</Button>
                        </WalletConnector>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <Text mt={6} mb={3} color="gray.400" fontSize={14}>
                Remain time: {countDown.hours} hours {countDown.minutes} minutes{' '}
                {countDown.seconds} seconds
              </Text>
              <Text color="gray.400" fontSize={14}>
                You can find this order{' '}
                <Link textDecoration="underline" href="/arc20/order">
                  here
                </Link>
              </Text>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PaymentModal
