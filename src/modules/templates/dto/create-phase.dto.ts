import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTemplatePhaseDto {
  @ApiProperty({ description: 'ชื่อเฟสของเทมเพลต', example: 'งานโครงสร้าง' })
  @IsString({ message: 'ชื่อเฟสต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อเฟส' })
  name: string;

  @ApiProperty({ description: 'ลำดับเฟส', example: 1 })
  @IsNumber({}, { message: 'ลำดับเฟสต้องเป็นตัวเลข' })
  @IsOptional()
  order_index?: number;

  @ApiProperty({ description: 'จำนวนวันที่เริ่มหลังจากเริ่มโครงการ', example: 0, required: false })
  @IsNumber({}, { message: 'จำนวนวันต้องเป็นตัวเลข' })
  @IsOptional()
  start_offset_day?: number;

  @ApiProperty({ description: 'ระยะเวลาดำเนินงาน (วัน)', example: 30, required: false })
  @IsNumber({}, { message: 'ระยะเวลาต้องเป็นตัวเลข' })
  @IsOptional()
  duration_days?: number;

  @ApiProperty({ description: 'งบประมาณที่คาดการณ์', example: 500000, required: false })
  @IsNumber({}, { message: 'งบประมาณต้องเป็นตัวเลข' })
  @IsOptional()
  budget_estimate?: number;
}
