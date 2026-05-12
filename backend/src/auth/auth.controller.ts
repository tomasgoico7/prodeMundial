import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly notifications: NotificationsService,
  ) {}

  @Public()
  @Throttle({
    default: { limit: Number(process.env.AUTH_REGISTER_LIMIT ?? 5), ttl: 60_000 },
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.auth.register(dto);
    // aviso de bienvenida (fase de grupos) — no bloquea el registro
    void this.notifications
      .welcomeGroupPhase(result.user.email, result.user.firstName)
      .catch(() => undefined);
    return result;
  }

  @Public()
  @Throttle({
    default: { limit: Number(process.env.AUTH_LOGIN_LIMIT ?? 10), ttl: 60_000 },
  })
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.findPublicById(user.id);
  }
}
