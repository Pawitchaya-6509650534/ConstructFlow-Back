import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '../../generated/prisma/client.js';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '1',
    username: 'test_dev',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'Dev',
    role: UserRole.ENGINEER,
    is_active: true,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        username: 'test',
        password: '123',
        email: 'test@example.com',
      };
      mockUsersService.create.mockResolvedValueOnce(mockUser);

      expect(await controller.create(dto)).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all users based on queries', async () => {
      mockUsersService.findAll.mockResolvedValueOnce([mockUser]);

      expect(await controller.findAll(UserRole.ENGINEER, 'true')).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalledWith(UserRole.ENGINEER, true);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockUsersService.findOne.mockResolvedValueOnce(mockUser);

      expect(await controller.findOne('1')).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValueOnce(mockUser);

      expect(await controller.remove('1')).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('resetPassword', () => {
    it('should reset a user password', async () => {
      const dto: ResetPasswordDto = { password: 'newpassword123' };
      mockUsersService.resetPassword.mockResolvedValueOnce(mockUser);

      expect(await controller.resetPassword('1', dto)).toEqual(mockUser);
      // It hashes the password in the controller, so we just verify it was called
      expect(service.resetPassword).toHaveBeenCalled();
    });
  });
});
