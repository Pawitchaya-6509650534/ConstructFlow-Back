import { PartialType } from '@nestjs/swagger';
import { CreateProjectPhaseDto } from './create-project-phase.dto';

export class UpdateProjectPhaseDto extends PartialType(CreateProjectPhaseDto) {}
