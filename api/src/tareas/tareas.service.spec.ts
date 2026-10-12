import { NotFoundException } from '@nestjs/common';
import { TareasService } from './tareas.service';

describe('TareasService', () => {
  const prisma = {
    tarea: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  const service = new TareasService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('lanza 404 si la tarea no existe', async () => {
    prisma.tarea.findUnique.mockResolvedValue(null);
    await expect(service.obtener(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('calcula skip y totalPaginas', async () => {
    prisma.tarea.findMany.mockResolvedValue([]);
    prisma.tarea.count.mockResolvedValue(23);

    const resultado = await service.listar({ pagina: 3, limite: 10 });

    expect(prisma.tarea.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
    expect(resultado.totalPaginas).toBe(3);
  });

  it('totalPaginas es al menos 1 aunque no haya tareas', async () => {
    prisma.tarea.findMany.mockResolvedValue([]);
    prisma.tarea.count.mockResolvedValue(0);
    expect((await service.listar({ pagina: 1, limite: 10 })).totalPaginas).toBe(1);
  });
});
