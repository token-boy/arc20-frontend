export const MEMPOOL_URL = process.env.NEXT_PUBLIC_MEMPOOL_URL

export const UINT_MAX = 2**32 - 1
export const UINT8_MAX = 2**64 - 1

export enum OrderType {
  InitDFT = 1,
  MintDFT = 2,
  MintDDFT = 3,
  MintNFT = 4,
}

export enum OrderStatus {
  Pending = 1,
  Timeout = 2,
  Completed = 3,
  WaitForMining = 4,
}


export const bitworkcMap: Dict = {
  '0000': {
    label: 'easy',
    timeSec: 64,
    timeFmt: '1 miunte',
  },
  '00000': {
    label: 'normal',
    timeSec: 1024,
    timeFmt: '16 minutes',
  },
  '000000': {
    label: 'hard',
    timeSec: 16384,
    timeFmt: '256 minutes',
  },
}
