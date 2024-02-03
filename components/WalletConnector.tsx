import { Account, useWallets } from '@/utils/wallet'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  Image,
  Box,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { useContext, useEffect, useRef } from 'react'
import { GlobalContext } from '../app/providers'
import { useMount } from 'ahooks'

const WalletConnector: React.FC<{ children: React.ReactNode }> = (props) => {
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()
  const {
    isOpen: isOpenAlertDialog,
    onOpen: onOpenAlertDialog,
    onClose: onCloseAlertDialog,
  } = useDisclosure()

  const cancelRef = useRef(null)

  const wallets = useWallets()
  const { setAccount, account } = useContext(GlobalContext)

  useEffect(() => {
    const account = localStorage.getItem('account')
    if (account) {
      setAccount(JSON.parse(account))
    }
  }, [wallets])

  return (
    <>
      <Modal isOpen={isOpenModal} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choose Wallet To Connect</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {Object.values(wallets).map((wallet, index) => (
              <Button
                key={index}
                variant="outline"
                w="full"
                justifyContent="flex-start"
                py={5}
                mb={5}
                _hover={{ bg: 'gray.700' }}
                onClick={async () => {
                  await wallet.connect()
                  onCloseModal()
                }}
              >
                <Image src={wallet.logo} alt={wallet.name} w={8} h={8} />
                <Box ml={2}>{wallet.name}</Box>
              </Button>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onCloseAlertDialog}
        isOpen={isOpenAlertDialog}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Tips</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Do you want to disconnect your wallet?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              ref={cancelRef}
              onClick={onCloseAlertDialog}
            >
              No
            </Button>
            <Button
              ml={3}
              onClick={() => {
                setAccount(undefined)
                localStorage.removeItem('account')
                onCloseAlertDialog()
              }}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Box
        onClick={() => {
          if (account) {
            onOpenAlertDialog()
          } else {
            onOpenModal()
          }
        }}
      >
        {props.children}
      </Box>
    </>
  )
}

export default WalletConnector
