'use client'

import { useContext } from 'react'
import {
  Button,
  Flex,
  HStack,
  Heading,
  Input,
  Image,
  Link,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

import { GlobalContext } from './providers'
import WalletConnector from '../components/WalletConnector'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'ARC20',
    href: '/arc20',
  },
  {
    name: 'NFT',
    href: '/nft',
  },
  // {
  //   name: 'Realm',
  //   href: '/realm',
  // },
  {
    name: 'Account',
    href: '/account',
  },
  // {
  //   name: 'About',
  //   href: '/about',
  // },
]

const Nav: React.FC = () => {
  const pathname = usePathname()

  const context = useContext(GlobalContext)

  return (
    <Flex
      as="nav"
      justify="space-between"
      align="center"
      px={10}
      py={5}
      position="sticky"
      top={0}
      bg="#121212"
      zIndex={10}
      mb={4}
    >
      <HStack spacing={12}>
        <Link href="/" _hover={{ textDecoration: 'none' }}>
          <HStack cursor="pointer">
            <Image src="/logo.png" alt="logo" w={8} h={8} />
            <Heading as="h1" fontSize={24}>
              Atomicals
            </Heading>
          </HStack>
        </Link>
        <HStack spacing={5} fontSize={16}>
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              variant={
                link.href.split('/')[1] === pathname.split('/')[1]
                  ? 'underline'
                  : 'link'
              }
            >
              {link.name}
            </Link>
          ))}
        </HStack>
      </HStack>
      <HStack spacing={6}>
        <Input type="search" placeholder="Search" w={240} variant="outline" />
        <WalletConnector>
          <Button variant="solid">
            {context.account?.provider && (
              <Image
                src={context.account.provider.logo}
                alt={context.account?.provider.name}
                w={5}
                h={5}
                mr={2}
              />
            )}
            {context.account?.address
              ? `${context.account.address.slice(
                  0,
                  5
                )}...${context.account.address.slice(-5)}`
              : 'Connect Wallet'}
          </Button>
        </WalletConnector>
      </HStack>
    </Flex>
  )
}

export default Nav
