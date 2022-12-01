type GroupId = string
type UserId = number
type JoinCode = string

type Group = {
  groupId: GroupId
  name: string
  ownerId: UserId
  joinCode: JoinCode
}

type User = {
  userId: UserId
  firstName: string
  username: string | null
}

interface Store {
  createGroup(args: { name: string, ownerId: UserId }): Promise<Group>
  saveUser(args: { userId: UserId, firstName: string, username: string | null }): Promise<User>

  findGroup(args: { groupId: GroupId }): Promise<Group | undefined>
  findGroup(args: { joinCode: JoinCode }): Promise<Group | undefined>
  findGroupMembers(args: { groupId: GroupId }): Promise<User[]>

  addGroupMember(args: { groupId: GroupId, userId: UserId }): Promise<void>
  findUserGroups(args: { userId: UserId }): Promise<Group[]>
}

export type { Group, GroupId, User, UserId, Store, JoinCode }
