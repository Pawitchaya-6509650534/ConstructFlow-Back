import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return tokens', async () => {
      const dto: LoginDto = { username: 'testuser', password: 'password123' };
      const expectedTokens = { access_token: 'ac_token', refresh_token: 'rf_token' };
      
      mockAuthService.login.mockResolvedValueOnce(expectedTokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedTokens);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const user = { userId: '1' };
      mockAuthService.logout.mockResolvedValueOnce({ message: 'Logged out' });

      const result = await controller.logout(user);

      expect(authService.logout).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  describe('getMe', () => {
    it('should call authService.getMe and return user', async () => {
      const user = { userId: '1' };
      const expectedUser = { id: '1', username: 'testuser' };
      
      mockAuthService.getMe.mockResolvedValueOnce(expectedUser);

      const result = await controller.getMe(user);

      expect(authService.getMe).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedUser);
    });
  });
});
