import * as crypto from 'crypto'

type GroupId = string
type JoinCode = string
type UserId = number

type GroupMetadata = {
  groupId: GroupId
  name: string
  joinCode: JoinCode
  ownerId: UserId
}

/* const jsonTree = {
  groups: {
    '0000': { groupId: '000', name: 'Asdf', ownerId: 123 }
  },
  groupIdByInviteCode: {
    'abcd': '0000',
  },
  groupMembers: {
    '0000': { '7700358': true, '14964306': true }
  },
  userGroups: {
    '7700358': { '0000': true }
  },
}
 */

const inMemoryDb = {
  groupMetadata: {
    '0000': { groupId: '0000', joinCode: 'abcd', name: 'Colegas', ownerId: 1234 }
  } as Record<GroupId, GroupMetadata>,
  groupMembers: {
    '0000': [14964306, 7700358]
  } as Record<GroupId, Array<UserId>>
}

export async function createGroup(groupMetadata: {
  name: string
  ownerId: UserId
}): Promise<GroupMetadata> {
  const { name, ownerId } = groupMetadata

  const groupId = `${ownerId}:${crypto.randomBytes(4).toString('hex')}`
  const joinCode = crypto.randomBytes(2).toString('hex')

  inMemoryDb.groupMetadata[groupId] = { groupId, joinCode, name, ownerId }

  inMemoryDb.groupMembers[groupId] = inMemoryDb.groupMembers[groupId] ?? []
  inMemoryDb.groupMembers[groupId].push(ownerId)

  return inMemoryDb.groupMetadata[groupId]
}

export async function findGroupMetadata(groupId: string): Promise<GroupMetadata> {
  const groupMetadata = Object.values(inMemoryDb.groupMetadata).find(groupMetadata => groupMetadata.groupId === groupId)

  if (!groupMetadata) {
    throw new Error(`No group with groupId ${groupId} found!`)
  }

  return groupMetadata
}

export async function findGroupMetadataByJoinCode(joinCode: string): Promise<GroupMetadata> {
  const groupMetadata = Object.values(inMemoryDb.groupMetadata).find(groupMetadata => groupMetadata.joinCode === joinCode)

  if (!groupMetadata) {
    throw new Error(`No group with join code ${joinCode} found!`)
  }

  return groupMetadata
}

export async function findGroupMembers(groupId: string): Promise<UserId[]> {
   const groupMembers = inMemoryDb.groupMembers[groupId]

   if (!groupMembers) {
    throw new Error(`No group with groupId ${groupId} found!`)
   }
   
   return groupMembers
}

export async function addGroupMember(groupId: string, userId: UserId): Promise<void> {
  const groupMetadata = await findGroupMetadata(groupId)
  inMemoryDb.groupMembers[groupMetadata.groupId].push(userId)
}

export async function findGroupsUserIsMemberOf(userId: UserId): Promise<GroupMetadata[]> {
    const groupIds = Object.entries(inMemoryDb.groupMembers).flatMap(
      ([groupId, members]) => {
        const isMember = members.includes(userId)
        console.log('>>> isMember', isMember, groupId, userId, members)
        return isMember ? [groupId] : []
      },
    )
    const groups = await Promise.all(groupIds.map(groupId => findGroupMetadata(groupId)))

    return groups
}

createGroup
findGroupMetadata
findGroupMetadataByJoinCode
findGroupMembers
addGroupMember
findGroupsUserIsMemberOf