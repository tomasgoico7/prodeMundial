import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { PublicUser } from './users.types';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async findPublicById(id: string): Promise<PublicUser> {
    const user = await this.repo.findPublicById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(input: CreateUserInput): Promise<User> {
    // Sin avatar por defecto → se muestra la silueta genérica hasta que elija uno.
    return this.repo.create({ ...input });
  }

  updateProfile(id: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const data: Record<string, unknown> = {};
    if (dto.firstName) data.firstName = dto.firstName.trim();
    if (dto.lastName) data.lastName = dto.lastName.trim();
    // El avatar se mantiene salvo que el usuario elija uno nuevo.
    if (dto.avatarUrl) data.avatarUrl = dto.avatarUrl;
    return this.repo.update(id, data);
  }
}
