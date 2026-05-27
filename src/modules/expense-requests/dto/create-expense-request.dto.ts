import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExpenseRequestDto {
  @ApiProperty({ description: 'ID ของเฟสที่ต้องการเบิกจ่าย', example: 'uuid-phase' })
  @IsUUID('all', { message: 'ID ของเฟสต้องเป็น UUID' })
  @IsNotEmpty({ message: 'กรุณากรอก ID ของเฟส' })
  phase_id: string;

  @ApiProperty({ description: 'จำนวนเงินที่ต้องการเบิก', example: 5000 })
  @IsNumber({}, { message: 'จำนวนเงินต้องเป็นตัวเลข' })
  @IsNotEmpty({ message: 'กรุณากรอกจำนวนเงิน' })
  amount: number;

  @ApiProperty({ description: 'รายละเอียดการเบิกจ่าย', example: 'ค่าวัสดุอุปกรณ์เพิ่มเติม', required: false })
  @IsString({ message: 'รายละเอียดต้องเป็นข้อความ' })
  @IsOptional()
  description?: string;
}
