export const MEMPOOL_URL = process.env.NEXT_PUBLIC_MEMPOOL_URL

export const UINT_MAX = 2**32 - 1
export const UINT8_MAX = 2**64 - 1

export enum OrderType {
  InitDFT = 1,
}

export enum OrderStatus {
  Pending = 1,
  Timeout = 2,
  Completed = 3,
}
