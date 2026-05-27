import { Module } from '@nestjs/common';
import { ExpenseRequestsController } from './expense-requests.controller';
import { ExpenseRequestsService } from './expense-requests.service';
import { R2Module } from 'src/common/r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [ExpenseRequestsController],
  providers: [ExpenseRequestsService]
})
export class ExpenseRequestsModule { }
