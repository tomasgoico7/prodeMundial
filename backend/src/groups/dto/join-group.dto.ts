import { IsString, Length } from 'class-validator';

export class JoinGroupDto {
  @IsString()
  @Length(6, 10)
  inviteCode!: string;
}
