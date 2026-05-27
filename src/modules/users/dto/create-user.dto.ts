import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../generated/prisma/client.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'ชื่อผู้ใช้',
    example: 'engineer',
  })
  @IsString({ message: 'ชื่อผู้ใช้ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้' })
  username: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'password',
  })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  password: string;

  @ApiProperty({
    description: 'อีเมล',
    example: 'somchai@example.com',
  })
  @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email: string;

  @ApiProperty({
    description: 'ชื่อจริง',
    example: 'สมชาย',
  })
  @IsString({ message: 'ชื่อจริงต้องเป็นข้อความ' })
  @IsOptional()
  first_name?: string;

  @ApiProperty({
    description: 'นามสกุล',
    example: 'ใจดี',
  })
  @IsString({ message: 'นามสกุลต้องเป็นข้อความ' })
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    description: 'บทบาทผู้ใช้ (Role)',
    example: UserRole.ENGINEER,
  })
  @IsEnum(UserRole, { message: 'บทบาทไม่ถูกต้อง' })
  @IsOptional()
  role?: UserRole;
}
