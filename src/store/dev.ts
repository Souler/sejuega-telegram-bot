import get from 'lodash/get'
import set from 'lodash/set'
import { Store } from './types'

export function devStore(): Store {
  const storage: Record<string, any> = {}
  const slashPathToDotPath = (slashPath: string) => slashPath.replace('/', '.')
  
  return {
    async get(path) {
      return get(storage, slashPathToDotPath(path))
    },

    async update(updates) {
      for (const [path, value] of Object.entries(updates)) {
        set(storage, slashPathToDotPath(path), value)
      }
    }
  }
}
