import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTemplateCheckpointDto {
  @ApiProperty({ description: 'ชื่อจุดตรวจสอบ', example: 'งานตอกเสาเข็ม' })
  @IsString({ message: 'ชื่อจุดตรวจสอบต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อจุดตรวจสอบ' })
  name: string;

  @ApiProperty({ description: 'ลำดับจุดตรวจสอบ', example: 1 })
  @IsNumber({}, { message: 'ลำดับจุดตรวจสอบต้องเป็นตัวเลข' })
  @IsOptional()
  order_index?: number;
}
