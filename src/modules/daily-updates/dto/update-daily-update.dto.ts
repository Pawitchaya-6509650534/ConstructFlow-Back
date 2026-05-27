import { PartialType } from '@nestjs/swagger';
import { CreateDailyUpdateDto } from './create-daily-update.dto';

export class UpdateDailyUpdateDto extends PartialType(CreateDailyUpdateDto) {}
