import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let users: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findPublicById: jest.Mock;
  };
  let jwt: { signAsync: jest.Mock };

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findPublicById: jest.fn(),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    service = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('throws if the email already exists', async () => {
      users.findByEmail.mockResolvedValue({ id: '1' } as never);
      await expect(
        service.register({
          firstName: 'Lionel',
          lastName: 'Messi',
          email: 'leo@afa.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes the password and returns a token', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue({ id: '1', email: 'leo@afa.com' } as never);
      users.findPublicById.mockResolvedValue({ id: '1' } as never);

      const result = await service.register({
        firstName: 'Lionel',
        lastName: 'Messi',
        email: 'leo@afa.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      const createArg = users.create.mock.calls[0][0];
      expect(createArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nope@x.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct', 10);
      users.findByEmail.mockResolvedValue({
        id: '1',
        email: 'leo@afa.com',
        passwordHash,
      } as never);
      await expect(
        service.login({ email: 'leo@afa.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues a token on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct', 10);
      users.findByEmail.mockResolvedValue({
        id: '1',
        email: 'leo@afa.com',
        passwordHash,
      } as never);
      users.findPublicById.mockResolvedValue({ id: '1' } as never);

      const result = await service.login({
        email: 'leo@afa.com',
        password: 'correct',
      });
      expect(result.accessToken).toBe('signed.jwt.token');
    });
  });
});
