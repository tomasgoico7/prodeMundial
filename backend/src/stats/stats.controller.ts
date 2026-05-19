import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import { GroupsService } from '../groups/groups.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('groups/:id/stats')
export class StatsController {
  constructor(
    private readonly stats: StatsService,
    private readonly groups: GroupsService,
  ) {}

  @Get()
  async groupStats(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.groups.getDetail(id, userId); // membership guard
    return this.stats.getGroupStats(id);
  }
}
