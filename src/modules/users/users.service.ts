import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../generated/prisma/client.js';
import { BasePaginationDto } from 'src/common/util/base-pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const { username, password, email, first_name, last_name, role } =
      createUserDto;

    // Check if user already exists (username or email)
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      throw new ConflictException(`${field} already exists`);
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    return this.prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        first_name,
        last_name,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
      },
    });
  }

  async findAll(query: BasePaginationDto, role?: UserRole, is_active?: boolean) {
    const { page = 1, limit = 10, searchKeyword } = query;

    const where: any = { deleted_at: null };

    if (role) {
      where.role = role;
    }
    if (is_active) {
      where.is_active = is_active;
    }
    if (searchKeyword) {
      where.OR = [
        {
          first_name: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        },
        {
          last_name: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    let orderBy: any = { created_at: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        password_hash: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    const { password, ...rest } = updateUserDto;
    const data: any = { ...rest };

    if (password) {
      const salt = await bcrypt.genSalt();
      data.password_hash = await bcrypt.hash(password, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        updated_at: true,
      },
    });
  }

  async remove(id: string) {
    // Soft delete
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }

  async resetPassword(id: string, password_hash: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { password_hash, updated_at: new Date() },
      select: { id: true, username: true, updated_at: true },
    });
  }
}
