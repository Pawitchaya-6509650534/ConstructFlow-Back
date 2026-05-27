import { PartialType } from '@nestjs/swagger';
import { CreateTemplatePhaseDto } from './create-phase.dto';

export class UpdateTemplatePhaseDto extends PartialType(CreateTemplatePhaseDto) {}
