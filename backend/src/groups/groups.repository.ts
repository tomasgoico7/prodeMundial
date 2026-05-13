import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_USER_SELECT } from '../users/users.types';

const GROUP_DETAIL_INCLUDE = {
  owner: { select: PUBLIC_USER_SELECT },
  members: {
    include: { user: { select: PUBLIC_USER_SELECT } },
    orderBy: { joinedAt: 'asc' as const },
  },
  _count: { select: { members: true } },
} satisfies Prisma.GroupInclude;

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.GroupCreateInput) {
    return this.prisma.group.create({ data });
  }

  findByInviteCode(inviteCode: string) {
    return this.prisma.group.findUnique({ where: { inviteCode } });
  }

  findDetail(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: GROUP_DETAIL_INCLUDE,
    });
  }

  findForUser(userId: string) {
    return this.prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { members: true } },
        owner: { select: PUBLIC_USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  isMember(groupId: string, userId: string) {
    return this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  addMember(groupId: string, userId: string, role: Prisma.GroupMemberCreateInput['role'] = 'MEMBER') {
    return this.prisma.groupMember.create({
      data: { group: { connect: { id: groupId } }, user: { connect: { id: userId } }, role },
    });
  }

  createStanding(groupId: string, userId: string) {
    return this.prisma.standing.upsert({
      where: { groupId_userId: { groupId, userId } },
      update: {},
      create: { groupId, userId },
    });
  }

  createInvitation(data: Prisma.InvitationCreateInput) {
    return this.prisma.invitation.create({ data });
  }

  listInvitations(groupId: string) {
    return this.prisma.invitation.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
