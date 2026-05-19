import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class MatchPredictionDto {
  @IsString()
  matchId!: string;

  @IsInt()
  @Min(0)
  @Max(20)
  homeScore!: number;

  @IsInt()
  @Min(0)
  @Max(20)
  awayScore!: number;
}

export class SubmitPredictionDto {
  @IsOptional()
  @IsString()
  championTeamId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MatchPredictionDto)
  matches!: MatchPredictionDto[];
}
