import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class TokenAuthMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const esperado = this.config.getOrThrow<string>('API_TOKEN');
    const recibido = this.extraerToken(req);

    if (!recibido || !this.sonIguales(recibido, esperado)) {
      throw new UnauthorizedException('Token inválido o ausente');
    }
    next();
  }

  private extraerToken(req: Request): string | undefined {
    const [tipo, valor] = (req.headers.authorization ?? '').split(' ');
    if (tipo === 'Bearer' && valor) return valor;
    const header = req.headers['x-api-token'];
    return typeof header === 'string' ? header : undefined;
  }

  // Comparación en tiempo constante para no filtrar el token por diferencias de tiempo.
  private sonIguales(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}
