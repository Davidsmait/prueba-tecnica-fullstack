import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

const TOKEN = process.env.API_TOKEN ?? 'cambia-este-token';
const auth = { Authorization: `Bearer ${TOKEN}` };

describe('API de tareas (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(() => prisma.tarea.deleteMany());
  afterAll(() => app.close());

  it('rechaza peticiones sin token o con token inválido', async () => {
    await request(app.getHttpServer()).get('/tareas').expect(401);
    await request(app.getHttpServer()).get('/tareas').set('Authorization', 'Bearer otro').expect(401);
  });

  it('acepta el token también en x-api-token', async () => {
    await request(app.getHttpServer()).get('/tareas').set('x-api-token', TOKEN).expect(200);
  });

  it('health es público', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });

  it('CRUD completo', async () => {
    const server = app.getHttpServer();

    const creada = await request(server)
      .post('/tareas')
      .set(auth)
      .send({ titulo: '  Primera tarea  ', descripcion: 'detalle' })
      .expect(201);
    expect(creada.body).toMatchObject({ titulo: 'Primera tarea', completado: false });
    expect(creada.body.fechaCreacion).toBeDefined();

    const id = creada.body.id;
    await request(server).get(`/tareas/${id}`).set(auth).expect(200);

    const actualizada = await request(server)
      .patch(`/tareas/${id}`)
      .set(auth)
      .send({ completado: true })
      .expect(200);
    expect(actualizada.body.completado).toBe(true);

    await request(server).delete(`/tareas/${id}`).set(auth).expect(204);
    await request(server).get(`/tareas/${id}`).set(auth).expect(404);
  });

  it('valida el cuerpo', async () => {
    const server = app.getHttpServer();
    await request(server).post('/tareas').set(auth).send({ titulo: '' }).expect(400);
    await request(server).post('/tareas').set(auth).send({ titulo: 'x', extra: 1 }).expect(400);
    await request(server).post('/tareas').set(auth).send({ titulo: 'x', completado: 'si' }).expect(400);
  });

  it('pagina y filtra', async () => {
    await prisma.tarea.createMany({
      data: Array.from({ length: 12 }, (_, i) => ({ titulo: `Tarea ${i + 1}`, completado: i % 3 === 0 })),
    });
    const server = app.getHttpServer();

    const pagina2 = await request(server).get('/tareas?pagina=2&limite=5').set(auth).expect(200);
    expect(pagina2.body).toMatchObject({ total: 12, pagina: 2, limite: 5, totalPaginas: 3 });
    expect(pagina2.body.data).toHaveLength(5);

    const completadas = await request(server).get('/tareas?completado=true').set(auth).expect(200);
    expect(completadas.body.total).toBe(4);

    await request(server).get('/tareas?limite=500').set(auth).expect(400);
  });

  it('resume totales por estado', async () => {
    await prisma.tarea.createMany({
      data: [{ titulo: 'a', completado: true }, { titulo: 'b' }, { titulo: 'c' }],
    });
    await request(app.getHttpServer())
      .get('/tareas/resumen')
      .set(auth)
      .expect(200, { total: 3, completadas: 1, pendientes: 2 });
  });

  it('sube y descarga un adjunto', async () => {
    const server = app.getHttpServer();
    const { body } = await request(server).post('/tareas').set(auth).send({ titulo: 'Con archivo' });

    const conAdjunto = await request(server)
      .post(`/tareas/${body.id}/adjunto`)
      .set(auth)
      .attach('archivo', Buffer.from('hola'), { filename: 'nota.txt', contentType: 'text/plain' })
      .expect(201);
    expect(conAdjunto.body.adjuntoNombre).toBe('nota.txt');

    const descarga = await request(server).get(`/tareas/${body.id}/adjunto`).set(auth).expect(200);
    expect(descarga.text).toBe('hola');

    await request(server)
      .post(`/tareas/${body.id}/adjunto`)
      .set(auth)
      .attach('archivo', Buffer.from('MZ'), { filename: 'x.exe', contentType: 'application/x-msdownload' })
      .expect(400);
  });
});
