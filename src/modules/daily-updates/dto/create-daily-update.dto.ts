import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateDailyUpdateDto {
  @ApiProperty({
    description: 'รายละเอียดงานที่ทำในวันนี้',
    example: 'ติดตั้งโครงเหล็กชั้น 2 และเริ่มเดินสายไฟในส่วนห้องน้ำ',
  })
  @IsString({ message: 'งานที่ทำต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกงานที่ทำ' })
  work_done: string;

  @ApiProperty({
    description: 'ปัญหาหรืออุปสรรคที่พบ',
    example: 'ขาดแคลนไม้แบบ ทำให้ต้องรอของมาส่งช่วงบ่าย',
    required: false,
  })
  @IsString({ message: 'ปัญหาที่พบต้องเป็นข้อความ' })
  @IsOptional()
  issues?: string;

  @ApiProperty({
    description: 'URL ของรูปภาพแสดงความคืบหน้า',
    example: 'https://storage.example.com/projects/daily/image123.jpg',
    required: false,
  })
  @IsUrl({}, { message: 'URL ของรูปภาพไม่ถูกต้อง' })
  @IsOptional()
  image_url?: string;
}
