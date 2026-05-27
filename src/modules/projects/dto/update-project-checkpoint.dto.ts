import { PartialType } from '@nestjs/swagger';
import { CreateProjectCheckpointDto } from './create-project-checkpoint.dto';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { TaskStatus } from '../../../generated/prisma/client.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectCheckpointDto extends PartialType(
  CreateProjectCheckpointDto,
) {
  @ApiProperty({
    description: 'สถานะของจุดตรวจสอบ',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    required: false,
  })
  @IsEnum(TaskStatus, { message: 'สถานะไม่ถูกต้อง' })
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'บันทึกท้ายจุดตรวจสอบ',
    example: 'เทคอนกรีตเรียบร้อยแล้ว รอเซ็ตตัว 24 ชม.',
    required: false,
  })
  @IsString({ message: 'บันทึกต้องเป็นข้อความ' })
  @IsOptional()
  note_text?: string;

  @ApiProperty({
    description: 'URL ของรูปภาพหลักฐานการตรวจสอบ',
    example: 'https://storage.example.com/images/checkpoint-01.jpg',
    required: false,
  })
  @IsUrl({}, { message: 'URL ของรูปภาพไม่ถูกต้อง' })
  @IsOptional()
  image_url?: string;
}
