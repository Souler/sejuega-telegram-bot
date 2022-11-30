import * as crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { getDatabase } from 'firebase-admin/database'
import { Group, GroupId, Store, User, UserId } from './types'

export function firebaseStore(): Store {
  const database = getDatabase()

  const getRefPathVal = async <T = any>(path: string): Promise<T> => {
    const snapshot = await database.ref(path).get()
    const value = snapshot.val()
    return value
  }

  const store: Store = {
    async createGroup({ name, ownerId }) {
      const groupId = uuid()
      const joinCode = crypto.randomBytes(6).toString('base64')
      const group = { groupId, name, joinCode, ownerId }

      await database.ref().update({
        [`groups/${groupId}`]: group,
        [`groupsByJoinCode/${joinCode}`]: groupId,
        [`groupMembers/${groupId}/${ownerId}`]: true,
        [`userGroups/${ownerId}/${groupId}`]: true,
      })

      return group
    },

    async saveUser({ userId, firstName, username }) {
      const user = { userId, firstName, username }

      await database.ref().update({
        [`users/${userId}`]: user
      })

      return user
    },

    async findGroup(args) {
      if ('groupId' in args && args.groupId) {
        const group = await getRefPathVal<Group>(`groups/${args.groupId}`)
        return group ?? undefined
      }
      
      if ('joinCode' in args && args.joinCode) {
        const groupId = await getRefPathVal<GroupId>(`groupsByJoinCode/${args.joinCode}`)
        return groupId ? store.findGroup({ groupId }) : undefined
      }

      throw new TypeError('must provide either groupId or joinCode')
    },

    async findGroupMembers({ groupId }) {
      const membersMap = (await getRefPathVal<Record<UserId, boolean>>(`groupMembers/${groupId}`)) ?? {}
      const membersPromises = Object.entries(membersMap)
        .filter(([_, isMember]) => isMember)
        .map(([userId]) => getRefPathVal<User>(`users/${userId}`))
      const members = await Promise.all(membersPromises)

      return members
    },

    async addGroupMember({ groupId, userId }) {
      await database.ref().update({
        [`groupMembers/${groupId}/${userId}`]: true,
        [`userGroups/${userId}/${groupId}`]: true,
      })
    },

    async findUserGroups({ userId }) {
      const groupsMap = (await getRefPathVal<Record<GroupId, boolean>>(`userGroups/${userId}`)) ?? {}
      const groupsPromises = Object.entries(groupsMap)
        .filter(([_, isMember]) => isMember)
        .map(([groupId]) => store.findGroup({ groupId }))

      const groups = (await Promise.all(groupsPromises))
        .filter((group): group is Group => Boolean(group))

      return groups
    },
  }

  return store
}
