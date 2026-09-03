import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'

import { ProfessionalExperienceService } from '../services/professional-experience.service'
import { CreateProfessionalExperienceDto } from '../dto/create-professional-experience.dto'
import { UpdateProfessionalExperienceDto } from '../dto/update-professional-experience.dto'

import {
  DecodedUserPayload,
  RemoteJwtAuthGuard,
} from 'src/commons/guards/remote-jwt-auth.guard'

import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Professional Experiences')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('professional-experiences')
export class ProfessionalExperienceController {
  constructor(
    private readonly professionalExperienceService: ProfessionalExperienceService,
  ) {}

  @Post('me')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create professional experiences',
    description:
      'Creates multiple professional experiences for the authenticated person.',
  })
  @ApiCreatedResponse({
    description: 'Professional experiences created successfully.',
  })
  async createMany(
    @Req() req: { user: DecodedUserPayload },
    @Body() dto: CreateProfessionalExperienceDto[],
  ) {
    return this.professionalExperienceService.createMany(req.user, dto)
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List my professional experiences',
    description:
      'Returns all professional experiences belonging to the authenticated person.',
  })
  @ApiOkResponse({
    description: 'Professional experiences returned successfully.',
  })
  async findMine(@Req() req: { user: DecodedUserPayload }) {
    return this.professionalExperienceService.findMyExperiences(req.user)
  }

  @Patch('me/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update my professional experience',
    description:
      'Updates a professional experience belonging to the authenticated person.',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional experience ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Professional experience updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Professional experience not found.',
  })
  async updateMine(
    @Req() req: { user: DecodedUserPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfessionalExperienceDto,
  ) {
    return this.professionalExperienceService.updateMyExperience(
      req.user,
      id,
      dto,
    )
  }

  @Delete('me/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete my professional experience',
    description:
      'Deletes a professional experience belonging to the authenticated person.',
  })
  @ApiParam({
    name: 'id',
    description: 'Professional experience ID',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Professional experience deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Professional experience not found.',
  })
  async removeMine(
    @Req() req: { user: DecodedUserPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.professionalExperienceService.removeMyExperience(req.user, id)
  }

  @Get('person/:personId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List professional experiences by person',
    description:
      'Returns all professional experiences belonging to the specified person. This endpoint is intended for administrative access.',
  })
  @ApiParam({
    name: 'personId',
    description: 'Person ID',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Professional experiences returned successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Person not found.',
  })
  async findByPerson(@Param('personId', ParseIntPipe) personId: number) {
    return this.professionalExperienceService.findByPersonId(personId)
  }
}
