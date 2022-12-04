import * as fs from 'fs/promises'
import get from 'lodash/get'
import setWith from 'lodash/setWith'
import memoize from 'lodash/memoize'
import { Store } from './types'

const storePath = '.store.json'
const fsRead = memoize(async () => fs.readFile(storePath, 'utf8').then(value => JSON.parse(value)).catch(() => ({})))
const fsWrite = (value: unknown) => fs.writeFile(storePath, JSON.stringify(value, null, 2), 'utf8')

export function devStore(): Store {
  const storage: Record<string, any> = {}
  const slashPathToDotPath = (slashPath: string) => slashPath.replaceAll('/', '.')
  const loadIntialStoreValue = memoize(async () => { Object.assign(storage, await fsRead()) })

  return {
    async get(path) {
      await loadIntialStoreValue()
      return get(storage, slashPathToDotPath(path))
    },

    async update(updates) {
      for (const [path, value] of Object.entries(updates)) {
        setWith(storage, slashPathToDotPath(path), value, Object)
      }

      await fsWrite(storage)
    }
  }
}
