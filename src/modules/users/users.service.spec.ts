import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../generated/prisma/client.js';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '1',
    username: 'test_dev',
    email: 'test@example.com',
    password_hash: 'hashed',
    first_name: 'Test',
    last_name: 'Dev',
    role: UserRole.ENGINEER,
    is_active: true,
    created_at: new Date(),
    deleted_at: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if username already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);

      const dto: CreateUserDto = {
        username: 'test_dev',
        password: 'pw',
        email: 'test@example.com',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve('hashed_pw'));
      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

      const dto: CreateUserDto = {
        username: 'newuser',
        password: 'pw',
        email: 'new@example.com',
        role: UserRole.ENGINEER,
      };
      const result = await service.create(dto);

      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'newuser',
            email: 'new@example.com',
            password_hash: 'hashed_pw',
            role: UserRole.ENGINEER,
          }),
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      mockPrismaService.user.findMany.mockResolvedValueOnce([mockUser]);
      
      const result = await service.findAll();
      
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);
      
      const result = await service.findOne('1');
      
      expect(prismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', deleted_at: null } })
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is deleted or does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete user by updating deleted_at', async () => {
      // FindOne succeeds
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);
      mockPrismaService.user.update.mockResolvedValueOnce({ ...mockUser, is_active: false });

      await service.remove('1');

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({ is_active: false, deleted_at: expect.any(Date) })
        })
      );
    });
  });
});
