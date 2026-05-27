import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    password_hash: '$2b$10$xyz', // will be mocked correctly in tests
    role: 'CEO',
    refresh_token: 'valid_refresh_token',
    is_active: true,
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.login({ username: 'invalid', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(false));

      await expect(
        service.login({ username: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if login is successful', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true));
      mockJwtService.signAsync.mockResolvedValue('mocked_token');
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.resolve('hashed_refresh_token'));

      const result = await service.login({ username: 'testuser', password: 'password' });

      expect(result).toEqual({
        access_token: 'mocked_token',
        refresh_token: 'mocked_token',
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refresh_token: 'hashed_refresh_token' },
      });
    });
  });

  describe('getMe', () => {
    it('should return user details', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);
      const result = await service.getMe('user-id-1');
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-id-1', deleted_at: null } })
      );
    });
  });

  describe('logout', () => {
    it('should nullify refresh token', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce(mockUser);
      const result = await service.logout('user-id-1');
      
      expect(result).toEqual({ message: 'Logged out' });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { refresh_token: null },
      });
    });
  });
});
