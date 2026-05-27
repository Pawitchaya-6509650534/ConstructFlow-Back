import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectCheckpointDto {
  @ApiProperty({
    description: 'ชื่อจุดตรวจสอบ (Checkpoint)',
    example: 'ตรวจสอบความแน่นของดินฐานราก',
  })
  @IsString({ message: 'ชื่อจุดตรวจสอบต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อจุดตรวจสอบ' })
  name: string;

  @ApiProperty({
    description: 'ลำดับจุดตรวจสอบ (ถ้ามี)',
    example: 1,
    required: false,
  })
  @IsNumber({}, { message: 'ลำดับจุดตรวจสอบต้องเป็นตัวเลข' })
  @IsOptional()
  order_index?: number;
}
