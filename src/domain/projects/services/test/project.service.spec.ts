/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test } from '@nestjs/testing';
import { ProjectService } from '../project.service';
import { ProjectRepository } from '../../repositories/project.repository';
import { Project } from '../../entities/project.entity';

describe('ProjectService', () => {
  const repository = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
  };

  let service: ProjectService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(ProjectService);
    jest.clearAllMocks();
  });

  it('should create a project', async () => {
    repository.save.mockResolvedValue({
      id: '3e543de7-848e-4546-ab73-e6d4b5ea86bf',
      name: 'Test Project',
      client: 'Test client',
      imageUrl: 'https://example.com/image.png',
      isFavorite: false,
      startDate: '2026-04-11T17:31:18.217Z',
      endDate: '2026-05-11T17:31:18.217Z',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await service.create({
      name: 'Test Project',
      client: 'Test client',
      imageUrl: 'https://example.com/image.png',
      startDate: new Date('2026-04-11T17:31:18.217Z'),
      endDate: new Date('2026-05-11T17:31:18.217Z'),
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        client: 'Test client',
        imageUrl: 'https://example.com/image.png',
        isFavorite: false,
        startDate: new Date('2026-04-11T17:31:18.217Z'),
        endDate: new Date('2026-05-11T17:31:18.217Z'),
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(created).toEqual(
      expect.objectContaining({
        id: '3e543de7-848e-4546-ab73-e6d4b5ea86bf',
        name: 'Test Project',
        client: 'Test client',
        imageUrl: 'https://example.com/image.png',
        isFavorite: false,
        startDate: '2026-04-11T17:31:18.217Z',
        endDate: '2026-05-11T17:31:18.217Z',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should throw when search has less than 3 characters', async () => {
    await expect(
      service.list({
        search: 'ab',
        page: 1,
        limit: 10,
      }),
    ).rejects.toThrow('Search must have at least 3 characters');
    expect(repository.list).not.toHaveBeenCalled();
  });

  it('should throw not found when project does not exist', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    repository.findById.mockResolvedValue(null);

    await expect(service.getById(projectId)).rejects.toThrow(
      `Project with id ${projectId} not found`,
    );
    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(repository.findById).toHaveBeenCalledTimes(1);
  });

  it('should update favorite explicitly', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const project = new Project(
      projectId,
      'Test Project',
      'Test client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);
    repository.save.mockResolvedValue(project);

    await service.update(projectId, {
      isFavorite: true,
    });

    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: projectId,
        isFavorite: true,
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should list projects with valid search', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const mockResult = {
      data: [
        new Project(
          projectId,
          'Test Project',
          'Test client',
          'https://example.com/image.png',
          false,
          new Date('2026-04-11T17:31:18.217Z'),
          new Date('2026-05-11T17:31:18.217Z'),
          new Date(),
          new Date(),
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
    };
    repository.list.mockResolvedValue(mockResult);

    const result = await service.list({
      search: 'Test',
      page: 1,
      limit: 10,
    });

    expect(repository.list).toHaveBeenCalledWith({
      search: 'Test',
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(mockResult);
  });

  it('should list projects without search filter', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const mockResult = {
      data: [
        new Project(
          projectId,
          'Test Project',
          'Test client',
          'https://example.com/image.png',
          false,
          new Date('2026-04-11T17:31:18.217Z'),
          new Date('2026-05-11T17:31:18.217Z'),
          new Date(),
          new Date(),
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
    };
    repository.list.mockResolvedValue(mockResult);

    const result = await service.list({
      page: 1,
      limit: 10,
    });

    expect(repository.list).toHaveBeenCalledWith({
      search: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(mockResult);
  });

  it('should get project by id successfully', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const project = new Project(
      projectId,
      'Test Project',
      'Test client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);

    const result = await service.getById(projectId);

    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(result).toEqual(project);
  });

  it('should delete project successfully', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const project = new Project(
      projectId,
      'Test Project',
      'Test client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);
    repository.delete.mockResolvedValue(undefined);

    await service.delete(projectId);

    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(repository.delete).toHaveBeenCalledWith(projectId);
  });

  it('should update project name', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const project = new Project(
      projectId,
      'Old Name',
      'Test client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);
    repository.save.mockResolvedValue(project);

    await service.update(projectId, {
      name: 'New Name',
    });

    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Name',
      }),
    );
  });

  it('should update project client', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const project = new Project(
      projectId,
      'Test Project',
      'Old client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);
    repository.save.mockResolvedValue(project);

    await service.update(projectId, {
      client: 'New client',
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        client: 'New client',
      }),
    );
  });

  it('should update project imageUrl', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const project = new Project(
      projectId,
      'Test Project',
      'Test client',
      'https://example.com/old.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);
    repository.save.mockResolvedValue(project);

    await service.update(projectId, {
      imageUrl: 'https://example.com/new.png',
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'https://example.com/new.png',
      }),
    );
  });

  it('should update project schedule', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const newStartDate = new Date('2026-06-01T00:00:00.000Z');
    const newEndDate = new Date('2026-07-01T00:00:00.000Z');
    const project = new Project(
      projectId,
      'Test Project',
      'Test client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);
    repository.save.mockResolvedValue(project);

    await service.update(projectId, {
      startDate: newStartDate,
      endDate: newEndDate,
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: newStartDate,
        endDate: newEndDate,
      }),
    );
  });

  it('should throw BadRequestException when updating with invalid schedule', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    const invalidStartDate = new Date('2026-07-01T00:00:00.000Z');
    const invalidEndDate = new Date('2026-06-01T00:00:00.000Z');
    const project = new Project(
      projectId,
      'Test Project',
      'Test client',
      'https://example.com/image.png',
      false,
      new Date('2026-04-11T17:31:18.217Z'),
      new Date('2026-05-11T17:31:18.217Z'),
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(project);

    await expect(
      service.update(projectId, {
        startDate: invalidStartDate,
        endDate: invalidEndDate,
      }),
    ).rejects.toThrow('endDate must be greater than or equal to startDate');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when deleting non-existent project', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    repository.findById.mockResolvedValue(null);

    await expect(service.delete(projectId)).rejects.toThrow(
      `Project with id ${projectId} not found`,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating non-existent project', async () => {
    const projectId = 'b57f69b2-4457-4e5d-9624-85a9717c7684';
    repository.findById.mockResolvedValue(null);

    await expect(
      service.update(projectId, { name: 'New Name' }),
    ).rejects.toThrow(`Project with id ${projectId} not found`);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when creating project with invalid schedule', async () => {
    const invalidStartDate = new Date('2026-07-01T00:00:00.000Z');
    const invalidEndDate = new Date('2026-06-01T00:00:00.000Z');

    await expect(
      service.create({
        name: 'Test Project',
        client: 'Test client',
        startDate: invalidStartDate,
        endDate: invalidEndDate,
      }),
    ).rejects.toThrow('endDate must be greater than or equal to startDate');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
