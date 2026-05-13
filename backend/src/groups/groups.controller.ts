import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { InviteDto } from './dto/invite.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGroupDto) {
    return this.groups.create(userId, dto);
  }

  @Get()
  listMine(@CurrentUser('id') userId: string) {
    return this.groups.listMine(userId);
  }

  @Post('join')
  join(@CurrentUser('id') userId: string, @Body() dto: JoinGroupDto) {
    return this.groups.joinByCode(userId, dto.inviteCode);
  }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.groups.getDetail(id, userId);
  }

  @Post(':id/invite')
  invite(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: InviteDto,
  ) {
    return this.groups.invite(id, userId, dto);
  }

  @Get(':id/invitations')
  invitations(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groups.listInvitations(id, userId);
  }
}
