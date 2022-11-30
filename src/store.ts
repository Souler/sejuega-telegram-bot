import { firebaseStore } from './store/firebase'
import { Store } from './store/types'

const store: Store = firebaseStore()

export default store
