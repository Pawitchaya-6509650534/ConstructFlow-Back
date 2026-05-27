import { Module } from '@nestjs/common';
import { DailyUpdatesController } from './daily-updates.controller';
import { DailyUpdatesService } from './daily-updates.service';
import { R2Module } from 'src/common/r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [DailyUpdatesController],
  providers: [DailyUpdatesService]
})
export class DailyUpdatesModule { }
