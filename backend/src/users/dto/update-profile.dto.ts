import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  // Avatar: o bien una URL de DiceBear (caritas viejas) o un data-URI SVG
  // generado por la app (camisetas de selecciones con dorsal).
  @IsOptional()
  @IsString()
  @MaxLength(12000)
  @Matches(
    /^(https:\/\/api\.dicebear\.com\/[\w.]+\/[\w-]+\/svg\?[\w%=&,.-]+|data:image\/svg\+xml,[A-Za-z0-9\-_.!~*'()%]+)$/,
  )
  avatarUrl?: string;
}
