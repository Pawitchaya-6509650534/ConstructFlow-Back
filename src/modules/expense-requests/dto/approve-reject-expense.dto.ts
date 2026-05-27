import { IsOptional, IsString } from 'class-validator';

export class ApproveRejectExpenseDto {
  @IsString()
  @IsOptional()
  reviewer_note?: string;
}
