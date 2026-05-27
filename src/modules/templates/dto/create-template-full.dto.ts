import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateTemplateCheckpointDto } from './create-checkpoint.dto';
import { CreateTemplatePhaseDto } from './create-phase.dto';
import { CreateTemplateDto } from './create-template.dto';
import { Type } from 'class-transformer';

class CreateTemplatePhaseNestedDto extends CreateTemplatePhaseDto {
  @ApiProperty({ type: [CreateTemplateCheckpointDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateCheckpointDto)
  checkpoints: CreateTemplateCheckpointDto[];
}

export class CreateTemplateFullDto extends CreateTemplateDto {
  @ApiProperty({ type: [CreateTemplatePhaseNestedDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateTemplatePhaseNestedDto)
  phases: CreateTemplatePhaseNestedDto[];
}
