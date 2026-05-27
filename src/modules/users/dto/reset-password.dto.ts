import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'รหัสผ่านใหม่',
    example: 'newpassword123',
  })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  password: string;
}
