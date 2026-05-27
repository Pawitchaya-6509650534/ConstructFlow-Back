import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../../generated/prisma/client.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectPhaseDto {
  @ApiProperty({
    description: 'ชื่อเฟสของโครงการ',
    example: 'งานวางรากฐาน',
  })
  @IsString({ message: 'ชื่อเฟสต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อเฟส' })
  name: string;

  @ApiProperty({
    description: 'ลำดับเฟส',
    example: 0,
    required: false,
  })
  @IsNumber({}, { message: 'ลำดับเฟสต้องเป็นตัวเลข' })
  @IsOptional()
  order_index?: number;

  @ApiProperty({
    description: 'วันที่เริ่มเฟส',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @ApiProperty({
    description: 'วันที่สิ้นสุดเฟส',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @ApiProperty({
    description: 'งบประมาณที่คาดการณ์',
    example: 100000,
    required: false,
  })
  @IsNumber({}, { message: 'งบประมาณต้องเป็นตัวเลข' })
  @IsOptional()
  budget_estimate?: number;

  @ApiProperty({
    description: 'สถานะของเฟส',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    required: false,
  })
  @IsEnum(TaskStatus, { message: 'สถานะไม่ถูกต้อง' })
  @IsOptional()
  status?: TaskStatus;
}
