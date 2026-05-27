import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean({ message: 'สถานะการทำงานต้องเป็นค่าความจริง (true/false)' })
  @IsOptional()
  is_active?: boolean;
}
