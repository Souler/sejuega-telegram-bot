import * as crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { Group, GroupId, Store, User, UserId } from './types'
import store from '../store'

export function database(): Store {
  const db: Store = {
    async createGroup({ name, ownerId }) {
      const groupId = uuid()
      const joinCode = crypto.randomBytes(6).toString('base64')
      const group = { groupId, name, joinCode, ownerId }

      await store.update({
        [`groups/${groupId}`]: group,
        [`groupsByJoinCode/${joinCode}`]: groupId,
        [`groupMembers/${groupId}/${ownerId}`]: true,
        [`userGroups/${ownerId}/${groupId}`]: true,
      })

      return group
    },

    async saveUser({ userId, firstName, username }) {
      const user = { userId, firstName, username }

      await store.update({
        [`users/${userId}`]: user
      })

      return user
    },

    async findGroup(args) {
      if ('groupId' in args && args.groupId) {
        const group = await store.get<Group>(`groups/${args.groupId}`)
        return group ?? undefined
      }
      
      if ('joinCode' in args && args.joinCode) {
        const groupId = await store.get<GroupId>(`groupsByJoinCode/${args.joinCode}`)
        return groupId ? db.findGroup({ groupId }) : undefined
      }

      throw new TypeError('must provide either groupId or joinCode')
    },

    async findGroupMembers({ groupId }) {
      const membersMap = (await store.get<Record<UserId, boolean>>(`groupMembers/${groupId}`)) ?? {}
      const membersPromises = Object.entries(membersMap)
        .filter(([_, isMember]) => isMember)
        .map(([userId]) => store.get<User>(`users/${userId}`))
      const members =( await Promise.all(membersPromises))
        .filter((user): user is User => Boolean(user))

      return members
    },

    async addGroupMember({ groupId, userId }) {
      await store.update({
        [`groupMembers/${groupId}/${userId}`]: true,
        [`userGroups/${userId}/${groupId}`]: true,
      })
    },

    async findUserGroups({ userId }) {
      const groupsMap = (await store.get<Record<GroupId, boolean>>(`userGroups/${userId}`)) ?? {}
      const groupsPromises = Object.entries(groupsMap)
        .filter(([_, isMember]) => isMember)
        .map(([groupId]) => db.findGroup({ groupId }))
      const groups = (await Promise.all(groupsPromises))
        .filter((group): group is Group => Boolean(group))

      return groups
    },
  }

  return db
}
