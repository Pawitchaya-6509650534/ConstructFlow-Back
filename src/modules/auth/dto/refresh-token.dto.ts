import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token' })
  @IsString({ message: 'Refresh Token ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณาระบุ Refresh Token' })
  refresh_token: string;
}
