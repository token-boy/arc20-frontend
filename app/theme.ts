import { extendTheme, defineStyleConfig } from '@chakra-ui/react'

const Button = defineStyleConfig({
  variants: {
    solid: {
      bg: 'primary',
      color: 'white',
      _hover: {
        bg: 'primary',
        opacity: '0.9',
        // transform: 'translateY(-2px)',
      },
      _active: {
        bg: 'primary',
        opacity: '0.7',
      },
      _disabled: {
        _hover: {
          bg: 'primary !important',
          opacity: 0.4,
        },
      },
    },
    gray: {
      bg: '#2C2C2C',
      color: 'white',
    },
    outline: {
      color: 'white',
      _hover: {
        borderColor: 'primaryl',
        color: 'primaryl',
        backgroundColor: 'transparent',
      },
      _active: {
        backgroundColor: 'transparent',
      },
    },
    primaryl: {
      bg: 'primaryl',
      color: 'white',
      _hover: {
        bg: 'primaryl',
        opacity: '0.9',
      },
      _active: {
        bg: 'primaryl',
        opacity: '0.7',
      },
    },
    
  },
})

const Input = defineStyleConfig({
  variants: {
    outline: {
      field: {
        borderColor: '#9D9DA5',
        borderRadius: 10,
        _hover: {
          borderColor: 'primaryr',
        },
        _focus: {
          boxShadow: '0px 0px 5px 0px #9662D1',
          borderColor: 'primaryr',
        },
      },
    },
  },
})

const NumberInput = defineStyleConfig({
  variants: {
    outline: {
      field: {
        borderColor: '#9D9DA5',
        borderRadius: 10,
        _hover: {
          borderColor: 'primaryr',
        },
        _focus: {
          boxShadow: '0px 0px 5px 0px #9662D1',
          borderColor: 'primaryr',
        },
      },
      stepper: {
        color: 'white',
      },
    },
  },
})

const Textarea = defineStyleConfig({
  variants: {
    outline: {
      borderColor: '#9D9DA5',
      borderRadius: 10,
      _hover: {
        borderColor: 'primaryr',
      },
      _focus: {
        boxShadow: '0px 0px 5px 0px #9662D1',
        borderColor: 'primaryr',
      },
    },
  },
})

const Link = defineStyleConfig({
  variants: {
    underline: {
      textDecoration: 'underline',
    },
    link: {
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
})

const Modal = defineStyleConfig({
  baseStyle: {
    overlay: {
      backdropFilter: 'blur(4px)',
    },
    dialog: {
      bg: 'gray.800',
    },
  },
})

const Tabs = defineStyleConfig({
  variants: {
    line: {
      tab: {
        _selected: {
          color: 'primaryl',
          borderBottomColor: 'primaryl',
        },
        _active: {
          bg: 'transparent',
        },
      },
      tablist: {
        borderBottomColor: 'gray.600',
      },
    },
  },
})

const theme = extendTheme({
  colors: {
    primary: 'linear-gradient(45deg, #43CBFF 0%, #9662D1 100%)',
    primaryl: '#43CBFF',
    primaryr: '#9662D1',
    bg: '#121212',
  },
  components: {
    Button,
    Input,
    Link,
    NumberInput,
    Textarea,
    Modal,
    Tabs,
  },
  styles: {
    global: {
      body: {
        bg: 'bg',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
      },
    },
  },
})

export default theme
