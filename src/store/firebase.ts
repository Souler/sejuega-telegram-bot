import { Store } from './types'

export function firebaseStore(): Store {
  return {
    async createGroup() {
      throw new Error('not yet implemented')
    },
    async saveUser() {
      throw new Error('not yet implemented')
    },
    async findGroup() {
      throw new Error('not yet implemented')
    },
    async findGroupMembers() {
      throw new Error('not yet implemented')
    },
    async addGroupMember() {
      throw new Error('not yet implemented')
    },
    async findUserGroups() {
      throw new Error('not yet implemented')
    },
  }
}
