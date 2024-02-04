type Dict<T = any> = Record<string, T>

interface Window {
  unisat: any
  wizz: any
  encodeWebp: (data: ImageData) => Promise<ArrayBuffer>
}

declare module 'qrcode'

type ReactFC<T = any> = React.FC<T & { children: React.ReactNode }>
