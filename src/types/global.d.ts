import { storeData } from '../data/storeData'

type Store = typeof storeData[number]

declare global {
  interface Window {
    kakao: any
    selectStoreFromOverlay: (store: Store) => void
  }
}

export {}