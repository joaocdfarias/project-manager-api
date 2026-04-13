import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProjectService } from '../../../domain/projects/services/project.service';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { ListProjectsQueryDto } from '../dtos/list-project.dto';
import { ProjectResponseDto } from '../dtos/project-response.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { ProjectResponseMapper } from '../mappers/project.mapper';
import { ProjectSortOrder } from '../../../domain/projects/repositories/project.repository';
import { ProjectsListResponseDto } from '../dtos/list-project-response.dto';
import * as storageTypes from '../../../infrastructure/storage/storage.types';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    @Inject(storageTypes.UPLOAD_URL_SERVICE)
    private readonly uploadUrlService: storageTypes.UploadUrlService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse({
    description: 'Não autorizado',
    example: {
      statusCode: 401,
      message: 'Invalid API key',
      error: 'Unauthorized',
    },
  })
  async create(@Body() body: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectService.create({
      name: body.name,
      client: body.client,
      imageUrl: body.imageUrl,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return ProjectResponseMapper.toResponse(project);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Termo para buscar no nome dos projetos',
    type: String,
  })
  @ApiQuery({
    name: 'favoritesOnly',
    required: false,
    description: 'Filtra apenas projetos favoritos',
    example: 'false',
    type: Boolean,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Ordenação dos projetos',
    example: ProjectSortOrder.ALPHABETICAL,
    enum: ProjectSortOrder,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade de projetos por página',
    example: 10,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Retorna a lista de projetos',
    type: ProjectsListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado',
    example: {
      statusCode: 401,
      message: 'Invalid API key',
      error: 'Unauthorized',
    },
  })
  async list(
    @Query() query: ListProjectsQueryDto,
  ): Promise<ProjectsListResponseDto> {
    const result = await this.projectService.list({
      search: query.search,
      favoritesOnly: query.favoritesOnly,
      sort: query.sort ?? ProjectSortOrder.ALPHABETICAL,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });

    return {
      total: result.total,
      data: result.data.map((project) =>
        ProjectResponseMapper.toResponse(project),
      ),
    };
  }

  @Get('upload-url')
  @ApiOperation({ summary: 'Gera URL temporária para upload direto no S3' })
  @ApiQuery({ name: 'filename', required: true, type: String })
  @ApiQuery({
    name: 'contentType',
    required: true,
    type: String,
    example: 'image/png',
  })
  @ApiOkResponse({
    schema: {
      example: {
        uploadUrl: 'https://...',
        fileUrl:
          'https://bucket.s3.sa-east-1.amazonaws.com/projects/uuid-file.png',
        key: 'projects/uuid-file.png',
        expiresIn: 300,
      },
    },
  })
  async getUploadUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    if (!filename) {
      throw new BadRequestException('filename is required');
    }

    if (!contentType?.startsWith('image/')) {
      throw new BadRequestException('contentType must be an image MIME type');
    }

    return this.uploadUrlService.createPresignedUploadUrl({
      filename,
      contentType,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um projeto pelo ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do projeto' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({
    description: 'Projeto não encontrado',
    example: {
      statusCode: 404,
      message: 'Project with id 1c29b775-b631-4602-a8d7-b0a4428eb2ab not found',
      error: 'Not Found',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado',
    example: {
      statusCode: 401,
      message: 'Invalid API key',
      error: 'Unauthorized',
    },
  })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectService.getById(id);
    return ProjectResponseMapper.toResponse(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um projeto parcialmente pelo ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do projeto' })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    example: {
      statusCode: 400,
      message: [
        'name must be a string',
        'startDate must be a Date instance',
        'endDate must be a Date instance',
        'isFavorite must be a boolean value',
      ],
      error: 'Bad Request',
    },
  })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({
    description: 'Projeto não encontrado',
    example: {
      statusCode: 404,
      message: 'Project with id 1c29b775-b631-4602-a8d7-b0a4428eb2ab not found',
      error: 'Not Found',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado',
    example: {
      statusCode: 401,
      message: 'Invalid API key',
      error: 'Unauthorized',
    },
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectService.update(id, {
      name: body.name,
      client: body.client,
      imageUrl: body.imageUrl,
      isFavorite: body.isFavorite,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return ProjectResponseMapper.toResponse(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um projeto pelo ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do projeto' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({
    description: 'Projeto não encontrado',
    example: {
      statusCode: 404,
      message: 'Project with id 1c29b775-b631-4602-a8d7-b0a4428eb2ab not found',
      error: 'Not Found',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado',
    example: {
      statusCode: 401,
      message: 'Invalid API key',
      error: 'Unauthorized',
    },
  })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.projectService.delete(id);
  }
}
