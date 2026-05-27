import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'ชื่อเทมเพลต',
    example: 'โครงการอาคารขนาดกลาง 1 ชั้น',
  })
  @IsString({ message: 'ชื่อเทมเพลตต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อเทมเพลต' })
  name: string;

  @ApiProperty({
    description: 'คำอธิบาย (ถ้ามี)',
    example: 'โครงการอาคารขนาดกลาง 1 ชั้น',
    required: false,
  })
  @IsString({ message: 'คำอธิบายต้องเป็นข้อความ' })
  @IsOptional()
  description?: string;
}
