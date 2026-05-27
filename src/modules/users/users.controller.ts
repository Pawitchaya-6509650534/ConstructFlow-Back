import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../generated/prisma/client.js';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BasePaginationDto } from 'src/common/util/base-pagination.dto';

@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CEO)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'is_active', required: false, type: String })
  findAll(
    @Query() query: BasePaginationDto,
    @Query('role') role?: UserRole,
    @Query('is_active') isActiveStr?: string,
  ) {
    const is_active =
      isActiveStr === 'true'
        ? true
        : isActiveStr === 'false'
          ? false
          : undefined;
    return this.usersService.findAll(query, role, is_active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/password')
  async resetPassword(
    @Param('id') id: string,
    @Body() resetDto: ResetPasswordDto,
  ) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(resetDto.password, salt);
    return this.usersService.resetPassword(id, hash);
  }
}
