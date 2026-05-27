import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignEngineerDto {
  @ApiProperty({
    description: 'ID ของวิศวกรที่ต้องการมอบหมาย',
    example: 'uuid-engineer',
  })
  @IsUUID()
  @IsNotEmpty()
  engineer_id: string;
}
