import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'ชื่อผู้ใช้',
    example: 'admin',
  })
  @IsString({ message: 'ชื่อผู้ใช้ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้' })
  username: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'admin1234',
  })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  password: string;
}
