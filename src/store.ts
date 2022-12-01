import { devStore } from './store/dev'
import { firebaseStore } from './store/firebase'
import { Store } from './store/types'

const store: Store = {
  async get() {
    throw new Error('store can not be accessed before calling initializeStore')
  },
  async update() {
    throw new Error('store can not be accessed before calling initializeStore')
  },
}

export default store
export function initializeStore(storeImpl: 'dev' | 'firebase') {
  const storeImplByName: Record<typeof storeImpl, () => Store> = {
    'dev': () => devStore(),
    'firebase': () => firebaseStore(),
  }
  const createStore = storeImplByName[storeImpl]
  Object.assign(store, createStore())

  return store
}
