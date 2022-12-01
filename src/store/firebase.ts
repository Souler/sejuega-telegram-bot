import { getDatabase } from 'firebase-admin/database'
import { Store } from './types'

export function firebaseStore(): Store {
  return {
    async get(path) {
      const snapshot = await getDatabase().ref(path).get()
      const value = snapshot.val()
      return value
    },

    async update(updates) {
      await getDatabase().ref().update(updates)
    }
  }
}
