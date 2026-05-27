import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus } from '../../../generated/prisma/client.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({
    description: 'สถานะโครงการ',
    enum: ProjectStatus,
    example: ProjectStatus.IN_PROGRESS,
    required: false,
  })
  @IsEnum(ProjectStatus, { message: 'สถานะโครงการไม่ถูกต้อง' })
  @IsOptional()
  status?: ProjectStatus;
}
