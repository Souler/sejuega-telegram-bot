import { memoryStore } from './store/memory'
import { firebaseStore } from './store/firebase'
import { Store } from './store/types'

const currentStore: Store = {} as Store

export default currentStore

export function inistializeStore(storeType: 'memory'): void
export function inistializeStore(storeType: 'memory' | 'firebase'): void {
  if (Object.keys(currentStore).length > 0) {
    throw new Error('store has already been initialized')
  }

  switch (storeType) {
    case 'memory':
      return void Object.assign(currentStore, memoryStore())
    case 'firebase':
      return void Object.assign(currentStore, firebaseStore())
    default:
      throw new TypeError(`unknown store type ${storeType}`)
  }
}
