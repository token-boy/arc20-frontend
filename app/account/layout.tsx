'use client'

import { Flex, Link, VStack } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

const links = [
  {
    name: 'Address',
    href: '/account',
  },
  {
    name: 'Orders',
    href: '/account/order',
  },
  {
    name: 'Tasks',
    href: '/account/tasks',
  },
]

const Layout: ReactFC = (props) => {
  const pathname = usePathname()

  return (
    <Flex px={40} mt={10}>
      <VStack borderRight="1px solid #5C5C5C" pr={5} mr={6} minH={600}>
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            bg={pathname === link.href ? 'gray.700' : 'transparent'}
            p={2}
            borderRadius={5}
            w={32}
            textAlign="center"
            fontSize={14}
            _hover={{ textDecoration: 'none', bg: 'gray.700' }}
          >
            {link.name}
          </Link>
        ))}
      </VStack>
      {props.children}
    </Flex>
  )
}

export default Layout
