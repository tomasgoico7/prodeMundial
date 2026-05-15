import { IsInt, Max, Min } from 'class-validator';

export class SetResultDto {
  @IsInt()
  @Min(0)
  @Max(30)
  homeScore!: number;

  @IsInt()
  @Min(0)
  @Max(30)
  awayScore!: number;
}
