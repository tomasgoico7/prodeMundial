import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { PublicUser } from '../users/users.types';

const SALT_ROUNDS = 12;

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.create({
      email: dto.email.toLowerCase().trim(),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      passwordHash,
    });

    return this.buildAuthResult(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResult(user.id, user.email);
  }

  private async buildAuthResult(
    id: string,
    email: string,
  ): Promise<AuthResult> {
    const payload: JwtPayload = { sub: id, email };
    const accessToken = await this.jwt.signAsync(payload);
    const user = await this.users.findPublicById(id);
    return { accessToken, user };
  }
}
