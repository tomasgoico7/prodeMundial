import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { GroupsRepository } from './groups.repository';
import { MailService } from '../mail/mail.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { InviteDto } from './dto/invite.dto';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class GroupsService {
  constructor(
    private readonly repo: GroupsRepository,
    private readonly mail: MailService,
  ) {}

  async create(userId: string, dto: CreateGroupDto) {
    const inviteCode = this.generateInviteCode();
    const group = await this.repo.create({
      name: dto.name.trim(),
      description: dto.description?.trim(),
      inviteCode,
      owner: { connect: { id: userId } },
      members: { create: { userId, role: 'OWNER' } },
    });
    await this.repo.createStanding(group.id, userId);
    return this.getDetail(group.id, userId);
  }

  listMine(userId: string) {
    return this.repo.findForUser(userId);
  }

  async getDetail(groupId: string, userId: string) {
    const group = await this.repo.findDetail(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }
    return group;
  }

  async joinByCode(userId: string, inviteCode: string) {
    const group = await this.repo.findByInviteCode(inviteCode.toUpperCase().trim());
    if (!group) {
      throw new NotFoundException('Invalid invite code');
    }
    const existing = await this.repo.isMember(group.id, userId);
    if (existing) {
      throw new ConflictException('You already belong to this group');
    }
    await this.repo.addMember(group.id, userId);
    await this.repo.createStanding(group.id, userId);
    return this.getDetail(group.id, userId);
  }

  async invite(groupId: string, userId: string, dto: InviteDto) {
    const group = await this.getDetail(groupId, userId); // membership check
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await this.repo.createInvitation({
      group: { connect: { id: group.id } },
      email: dto.email.toLowerCase().trim(),
      token,
      invitedBy: { connect: { id: userId } },
      expiresAt,
    });

    // Enviar el email de invitación con el código para unirse.
    const inviter = group.members.find((m) => m.userId === userId)?.user;
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Un crack';
    await this.mail.sendGroupInvite(
      dto.email.toLowerCase().trim(),
      group.name,
      inviterName,
      group.inviteCode,
    );

    return {
      email: dto.email,
      inviteCode: group.inviteCode,
      token,
      shareCode: group.inviteCode,
    };
  }

  async listInvitations(groupId: string, userId: string) {
    await this.getDetail(groupId, userId);
    return this.repo.listInvitations(groupId);
  }

  private generateInviteCode(length = 7): string {
    const bytes = randomBytes(length);
    let code = '';
    for (let i = 0; i < length; i++) {
      code += INVITE_CODE_ALPHABET[bytes[i] % INVITE_CODE_ALPHABET.length];
    }
    return code;
  }
}
