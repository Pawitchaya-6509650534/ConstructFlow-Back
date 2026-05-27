import { PartialType } from '@nestjs/swagger';
import { CreateTemplateCheckpointDto } from './create-checkpoint.dto';

export class UpdateTemplateCheckpointDto extends PartialType(CreateTemplateCheckpointDto) {}
