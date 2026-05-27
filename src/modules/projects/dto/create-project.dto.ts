import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProjectCheckpointDto } from './create-project-checkpoint.dto';

export class CreateProjectAssignmentDto {
  @ApiProperty({
    description: 'ID ของวิศวกร',
    example: 'uuid-engineer',
  })
  @IsUUID('all', { message: 'ID ของวิศวกรต้องเป็น UUID' })
  @IsNotEmpty({ message: 'กรุณากรอก ID ของวิศวกร' })
  engineer_id: string;
}

export class CreateProjectDocumentDto {
  @ApiProperty({
    description: 'ชื่อเอกสาร',
    example: 'เอกสาร 1',
  })
  @IsString({ message: 'ชื่อเอกสารต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อเอกสาร' })
  name: string;

  @ApiProperty({
    description: 'ประเภทเอกสาร',
    example: 'เอกสาร 1',
  })
  @IsString({ message: 'ประเภทเอกสารต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกประเภทเอกสาร' })
  type: string;

  @ApiProperty({
    description: 'URL ของเอกสาร',
    example: 'https://example.com/document.pdf',
  })
  @IsString({ message: 'URL ของเอกสารต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอก URL ของเอกสาร' })
  url: string;
}
export class CreateProjectDto {
  @ApiProperty({
    description: 'ชื่อโครงการ',
    example: 'โครงการก่อสร้างบ้านพักอาศัย',
  })
  @IsString({ message: 'ชื่อโครงการต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อโครงการ' })
  name: string;

  @ApiProperty({
    description: 'รายละเอียดโครงการ',
    example: 'โครงการก่อสร้างบ้านพักอาศัย 2 ชั้น',
    required: false,
  })
  @IsString({ message: 'รายละเอียดโครงการต้องเป็นข้อความ' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'งบประมาณรวมของโปรเจกต์',
    example: 5000000,
    required: false,
  })
  @IsNumber({}, { message: 'งบประมาณรวมต้องเป็นตัวเลข' })
  @Min(0, { message: 'งบประมาณรวมต้องไม่น้อยกว่า 0' })
  @IsOptional()
  budget_total?: number

  @ApiProperty({
    description: 'ID ของเทมเพลต (ถ้ามี)',
    example: 'uuid-template',
    required: false,
  })
  @IsUUID('all', { message: 'ID ของเทมเพลตต้องเป็น UUID' })
  @IsOptional()
  template_id?: string;

  @ApiProperty({
    description: 'วันที่เริ่มโครงการ',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @ApiProperty({
    description: 'วันที่สิ้นสุดโครงการ',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @ApiProperty({
    description: 'ชื่อเจ้าของโครงการ',
    example: 'คุณสมชาย',
    required: false,
  })
  @IsString({ message: 'ชื่อเจ้าของโครงการต้องเป็นข้อความ' })
  @IsOptional()
  owner_name?: string;

  @ApiProperty({
    description: 'เฟสของโครงการ',
    example: [
      {
        name: 'เฟส 1',
        order_index: 1,
        budget_estimate: 100000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        checkpoints: [
          {
            name: 'เฟส 1 จุดที่ 1',
            order_index: 1,
          },
          {
            name: 'เฟส 1 จุดที่ 2',
            order_index: 2,
          },
        ],
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectPhaseWithCheckpointsDto)
  phases?: CreateProjectPhaseWithCheckpointsDto[];

  @ApiProperty({
    description: 'วิศวกรที่ได้รับมอบหมาย',
    example: [
      {
        engineer_id: 'uuid-engineer',
      },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectAssignmentDto)
  assignments?: CreateProjectAssignmentDto[];

  @ApiProperty({
    description: 'เอกสารของโครงการ',
    example: [
      {
        name: 'เอกสาร 1',
        type: 'เอกสาร 1',
        url: 'https://example.com/document.pdf',
      },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectDocumentDto)
  documents?: CreateProjectDocumentDto[];
}

export class CreateProjectPhaseWithCheckpointsDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @IsOptional() order_index?: number;
  @IsOptional() @Type(() => Date) start_date?: Date;
  @IsOptional() @Type(() => Date) end_date?: Date;
  @IsNumber() @IsOptional() budget_estimate?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectCheckpointDto)
  checkpoints?: CreateProjectCheckpointDto[];
}
