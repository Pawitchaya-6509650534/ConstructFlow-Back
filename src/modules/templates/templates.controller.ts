import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CreateTemplatePhaseDto } from './dto/create-phase.dto';
import { UpdateTemplatePhaseDto } from './dto/update-phase.dto';
import { CreateTemplateCheckpointDto } from './dto/create-checkpoint.dto';
import { UpdateTemplateCheckpointDto } from './dto/update-checkpoint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateTemplateFullDto } from './dto/create-template-full.dto';
import { BasePaginationDto } from 'src/common/util/base-pagination.dto';

@ApiTags('Templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CEO)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  createTemplate(
    @Body() createDto: CreateTemplateDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.createTemplate(createDto, user.userId);
  }

  @Post('full')
  createFull(
    @Body() dto: CreateTemplateFullDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.createTemplateFull(dto, user.userId);
  }

  @Get()
  findAllTemplates(@Query() query: BasePaginationDto) {
    return this.templatesService.findAllTemplates(query);
  }

  @Get(':id')
  findOneTemplate(@Param('id') id: string) {
    return this.templatesService.findOneTemplate(id);
  }

  @Patch(':id')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.updateTemplate(id, dto, user.userId);
  }

  @Delete(':id')
  deleteTemplate(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.deleteTemplate(id, user.userId);
  }

  /* =========================
     PHASE
  ========================= */

  @Post(':id/phases')
  createPhase(
    @Param('id') templateId: string,
    @Body() dto: CreateTemplatePhaseDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.createPhase(templateId, dto, user.userId);
  }

  @Patch('phases/:phaseId')
  updatePhase(
    @Param('phaseId') phaseId: string,
    @Body() dto: UpdateTemplatePhaseDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.updatePhase(phaseId, dto, user.userId);
  }

  @Delete('phases/:phaseId')
  deletePhase(
    @Param('phaseId') phaseId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.deletePhase(phaseId, user.userId);
  }

  /* =========================
     CHECKPOINT
  ========================= */

  @Post('phases/:phaseId/checkpoints')
  createCheckpoint(
    @Param('phaseId') phaseId: string,
    @Body() dto: CreateTemplateCheckpointDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.createCheckpoint(phaseId, dto, user.userId);
  }

  @Patch('checkpoints/:checkpointId')
  updateCheckpoint(
    @Param('checkpointId') checkpointId: string,
    @Body() dto: UpdateTemplateCheckpointDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.updateCheckpoint(
      checkpointId,
      dto,
      user.userId,
    );
  }

  @Delete('checkpoints/:checkpointId')
  deleteCheckpoint(
    @Param('checkpointId') checkpointId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.templatesService.deleteCheckpoint(checkpointId, user.userId);
  }

  // @Get()
  // findAllTemplates() {
  //   return this.templatesService.findAllTemplates();
  // }

  // @Get(':id')
  // findTemplateById(@Param('id') id: string) {
  //   return this.templatesService.findTemplateById(id);
  // }

  // @Patch(':id')
  // updateTemplate(
  //   @Param('id') id: string,
  //   @Body() updateDto: UpdateTemplateDto,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.updateTemplate(id, updateDto, user.id);
  // }

  // @Delete(':id')
  // removeTemplate(@Param('id') id: string, @CurrentUser() user: any) {
  //   return this.templatesService.removeTemplate(id, user.id);
  // }

  // // --- Phases ---
  // @Post(':id/phases')
  // addPhase(
  //   @Param('id') templateId: string,
  //   @Body() dto: CreateTemplatePhaseDto,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.addPhase(templateId, dto, user.id);
  // }

  // @Patch(':id/phases/:phaseId')
  // updatePhase(
  //   @Param('id') templateId: string,
  //   @Param('phaseId') phaseId: string,
  //   @Body() dto: UpdateTemplatePhaseDto,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.updatePhase(templateId, phaseId, dto, user.id);
  // }

  // @Delete(':id/phases/:phaseId')
  // removePhase(
  //   @Param('id') templateId: string,
  //   @Param('phaseId') phaseId: string,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.removePhase(templateId, phaseId, user.id);
  // }

  // // --- Checkpoints ---
  // @Post(':id/phases/:phaseId/checkpoints')
  // addCheckpoint(
  //   @Param('id') templateId: string,
  //   @Param('phaseId') phaseId: string,
  //   @Body() dto: CreateTemplateCheckpointDto,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.addCheckpoint(
  //     templateId,
  //     phaseId,
  //     dto,
  //     user.id,
  //   );
  // }

  // @Patch(':id/phases/:phaseId/checkpoints/:checkpointId')
  // updateCheckpoint(
  //   @Param('id') templateId: string,
  //   @Param('phaseId') phaseId: string,
  //   @Param('checkpointId') checkpointId: string,
  //   @Body() dto: UpdateTemplateCheckpointDto,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.updateCheckpoint(
  //     templateId,
  //     phaseId,
  //     checkpointId,
  //     dto,
  //     user.id,
  //   );
  // }

  // @Delete(':id/phases/:phaseId/checkpoints/:checkpointId')
  // removeCheckpoint(
  //   @Param('id') templateId: string,
  //   @Param('phaseId') phaseId: string,
  //   @Param('checkpointId') checkpointId: string,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.templatesService.removeCheckpoint(
  //     templateId,
  //     phaseId,
  //     checkpointId,
  //     user.id,
  //   );
  // }
}
