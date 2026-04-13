import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'net';
import request from 'supertest';
import { AppModule } from '../../../../app.module';
import { DataSource } from 'typeorm';

type ProjectResponse = {
  id: string;
  name: string;
  client: string | null;
  imageUrl: string | null;
  isFavorite: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListProjectsResponse = {
  data: ProjectResponse[];
  total: number;
  page: number;
  limit: number;
};

describe('ProjectController (Integration)', () => {
  let app: INestApplication<Server>;
  let dataSource: DataSource;

  const apiKey = process.env.API_KEY ?? 'test-api-key';
  const notFoundId = '11111111-1111-1111-1111-111111111111';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      }),
    );

    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "projects" RESTART IDENTITY CASCADE;',
    );
  });

  describe('POST /projects', () => {
    it('should return 401 when API key is missing', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'Integration Test Project', client: 'Test' })
        .expect(401);
    });

    it('should create a project', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Integration Test Project',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as ProjectResponse;
          expect(body.id).toBeDefined();
          expect(body.name).toBe('Integration Test Project');
          expect(body.isFavorite).toBe(false);
        });
    });
  });

  describe('GET /projects', () => {
    it('should list projects', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'List Project',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .get('/projects')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as ListProjectsResponse;
          expect(Array.isArray(body.data)).toBe(true);
          expect(typeof body.total).toBe('number');
          expect(body.total).toBeGreaterThan(0);
        });
    });

    it('should return empty list when there are no projects', async () => {
      await request(app.getHttpServer())
        .get('/projects')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as { total: number; data: ProjectResponse[] };
          expect(body.total).toBe(0);
          expect(body.data).toEqual([]);
        });
    });

    it('should filter only favorite projects', async () => {
      const favoriteRes = await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Favorite Project',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      const nonFavoriteRes = await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Regular Project',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      const favorite = favoriteRes.body as ProjectResponse;
      const nonFavorite = nonFavoriteRes.body as ProjectResponse;

      await request(app.getHttpServer())
        .patch(`/projects/${favorite.id}`)
        .set('x-api-key', apiKey)
        .send({ isFavorite: true })
        .expect(200);

      await request(app.getHttpServer())
        .get('/projects?favoritesOnly=true')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as { total: number; data: ProjectResponse[] };
          expect(body.total).toBe(1);
          expect(body.data[0].id).toBe(favorite.id);
          expect(
            body.data.find((p) => p.id === nonFavorite.id),
          ).toBeUndefined();
        });
    });

    it('should sort projects alphabetically', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Zulu Project',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Alpha Project',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .get('/projects?sort=alphabetical')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as { data: ProjectResponse[] };
          expect(body.data[0].name).toBe('Alpha Project');
          expect(body.data[1].name).toBe('Zulu Project');
        });
    });

    it('should sort projects by recently started', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Older Start',
          client: 'Test',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-01-02T00:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Recent Start',
          client: 'Test',
          startDate: '2026-12-01T00:00:00.000Z',
          endDate: '2026-12-02T00:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .get('/projects?sort=recently_started')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as { data: ProjectResponse[] };
          expect(body.data[0].name).toBe('Recent Start');
        });
    });

    it('should sort projects by ending soon', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Ends Later',
          client: 'Test',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Ends First',
          client: 'Test',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-05-01T00:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .get('/projects?sort=ending_soon')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as { data: ProjectResponse[] };
          expect(body.data[0].name).toBe('Ends First');
        });
    });

    it('should search projects when term has at least 3 characters', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Alpha Platform',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Beta Service',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .get('/projects?search=Alpha')
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as { total: number; data: ProjectResponse[] };
          expect(body.total).toBe(1);
          expect(body.data[0].name).toContain('Alpha');
        });
    });

    it('should return 400 when search has less than 3 chars', async () => {
      await request(app.getHttpServer())
        .get('/projects?search=ab')
        .set('x-api-key', apiKey)
        .expect(400);
    });
  });

  describe('GET /projects/:id', () => {
    it('should return a project by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Find By Id',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      const created = createResponse.body as ProjectResponse;

      await request(app.getHttpServer())
        .get(`/projects/${created.id}`)
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          const body = res.body as ProjectResponse;
          expect(body.id).toBe(created.id);
          expect(body.name).toBe('Find By Id');
        });
    });

    it('should return 404 when project does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${notFoundId}`)
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer())
        .get('/projects/invalid-id')
        .set('x-api-key', apiKey)
        .expect(400);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update project fields', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'Old Name',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      const created = createResponse.body as ProjectResponse;

      await request(app.getHttpServer())
        .patch(`/projects/${created.id}`)
        .set('x-api-key', apiKey)
        .send({ name: 'New Name', isFavorite: true })
        .expect(200)
        .expect((res) => {
          const body = res.body as ProjectResponse;
          expect(body.id).toBe(created.id);
          expect(body.name).toBe('New Name');
          expect(body.isFavorite).toBe(true);
        });
    });

    it('should return 404 when updating non-existent project', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${notFoundId}`)
        .set('x-api-key', apiKey)
        .send({ name: 'New Name' })
        .expect(404);
    });

    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer())
        .patch('/projects/invalid-id')
        .set('x-api-key', apiKey)
        .send({ name: 'New Name' })
        .expect(400);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete project', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('x-api-key', apiKey)
        .send({
          name: 'To Delete',
          client: 'Test',
          startDate: '2026-04-11T03:00:00.000Z',
          endDate: '2026-04-12T03:00:00.000Z',
        })
        .expect(201);

      const created = createResponse.body as ProjectResponse;

      await request(app.getHttpServer())
        .delete(`/projects/${created.id}`)
        .set('x-api-key', apiKey)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/projects/${created.id}`)
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when deleting non-existent project', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${notFoundId}`)
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer())
        .delete('/projects/invalid-id')
        .set('x-api-key', apiKey)
        .expect(400);
    });
  });
});
