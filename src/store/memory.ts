import * as crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { Store, Group, GroupId, User, UserId, JoinCode } from './types'

type StoreTree = {
  users: { [userId: UserId]: User },
  groups: { [userId: GroupId]: Group },
  groupsByJoinCode: { [inviteCode: JoinCode]: GroupId },
  groupMembers: { [groupId: GroupId]: { [userId: UserId]: boolean } },
  userGroups: { [userId: UserId]: { [groupId: GroupId]: boolean } },
}


export function memoryStore(): Store {
  const storeTree: StoreTree = {
    users: {},
    groups: {},
    groupsByJoinCode: {},
    groupMembers: {},
    userGroups: {},
  }

  const store: Store = {
    async createGroup({ name, ownerId }) {
      const groupId = uuid()
      const joinCode = crypto.randomBytes(6).toString('base64')
      const group = { groupId, name, joinCode, ownerId }

      storeTree.groups[groupId] = group
      storeTree.groupsByJoinCode[joinCode] = groupId
      storeTree.groupMembers[groupId] = { [ownerId]: true }
      storeTree.userGroups[ownerId] = { [groupId]: true }

      return group
    },

    async saveUser({ userId, firstName, username }) {
      const user = { userId, firstName, username }

      storeTree.users[userId] = user

      return user
    },

    async findGroup(args) {
      if ('groupId' in args && args.groupId) {
        return storeTree.groups[args.groupId]
      }
      
      if ('joinCode' in args && args.joinCode) {
        const groupId = storeTree.groupsByJoinCode[args.joinCode]
        return storeTree.groups[groupId]
      }

      throw new TypeError('must provide either groupId or joinCode')
    },

    async findGroupMembers({ groupId }) {
      const memberIds: UserId[] = Object.entries(storeTree.groupMembers[groupId] ?? {})
        .filter(([_userId, isMember]) => isMember)
        .map(([userId]) => Number(userId))

      const members = memberIds
        .map(memberId => storeTree.users[memberId])
        .filter(Boolean)

      return members
    },

    async addGroupMember({ groupId, userId }) {
      storeTree.groupMembers[groupId][userId] = true
      storeTree.userGroups[userId][groupId] = true
    },

    async findUserGroups({ userId }) {
      const groupIds: GroupId[] = Object.entries(storeTree.userGroups[userId] ?? {})
        .filter(([_groupId, isMember]) => isMember)
        .map(([groupId]) => groupId)

      const groups = groupIds
        .map(groupId => storeTree.groups[groupId])
        .filter(Boolean)

      return groups
    },
  }

  return store
}