import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { GroupsService } from '../groups/groups.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('groups/:id/ranking')
export class RankingsController {
  constructor(
    private readonly rankings: RankingsService,
    private readonly groups: GroupsService,
  ) {}

  @Get()
  async global(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.groups.getDetail(id, userId); // membership guard
    return this.rankings.getGroupRanking(id);
  }

  @Get('phases')
  async phases(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.groups.getDetail(id, userId); // membership guard
    return this.rankings.getPhaseRankings(id);
  }

  @Get('matchday/:matchday')
  async matchday(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('matchday', ParseIntPipe) matchday: number,
  ) {
    await this.groups.getDetail(id, userId);
    return this.rankings.getMatchdayRanking(id, matchday);
  }
}
