import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { InMemoryUserRepository } from '../src/modules/users/infrastructure/database/prisma/repositories/user-in-memory.repository';
import { InMemoryAuthSessionRepository } from '../src/modules/auth/infrastructure/database/in-memory/auth-session-in-memory.repository';
import { USER_REPOSITORY } from '../src/modules/users/domain/repositories/user.repository';
import { AUTH_SESSION_REPOSITORY } from '../src/modules/auth/domain/repositories/auth-session.repository';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import { configureApp } from '../src/shared/configure-app';
import { FINANCIAL_ENTRY_REPOSITORY } from '../src/modules/financial-entries/domain/repositories/financial-entry.repository';
import { FinancialEntryInMemoryRepository } from '../src/modules/financial-entries/infrastructure/database/in-memory/financial-entry-in-memory.repository';

describe('Auth e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const users = new InMemoryUserRepository();
    const sessions = new InMemoryAuthSessionRepository();
    const financialEntries = new FinancialEntryInMemoryRepository();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useValue(users)
      .overrideProvider(AUTH_SESSION_REPOSITORY)
      .useValue(sessions)
      .overrideProvider(FINANCIAL_ENTRY_REPOSITORY)
      .useValue(financialEntries)
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('runs auth flow', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Gustavo',
      email: 'gustavo@email.com',
      password: 'senha123',
    });
    expect(response.status).toBe(201);

    const invalidUser = await request(app.getHttpServer()).post('/users').send({
      name: 'A',
      email: 'invalid',
      password: '123',
    });
    expect(invalidUser.status).toBe(400);

    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'gustavo@email.com',
      password: 'senha123',
    });
    expect(login.status).toBe(200);

    const me = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(me.status).toBe(200);

    const upload = await request(app.getHttpServer())
      .post('/financial-entries/upload')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .attach('file', Buffer.from('title,amount\nMercado,10.00\nMercado,15.50\nPosto,80.00\n'), {
        filename: 'Nubank_2026-07-28.csv',
        contentType: 'text/csv',
      });
    expect(upload.status).toBe(201);
    expect(upload.body.totalRegistrosInseridos).toBe(2);
    expect(upload.body.valores[0]).toMatchObject({
      lugar: 'Mercado',
      valor: '25.50',
      origem: 'FILE',
      tipo: 'SAIDA',
      nomeArquivo: 'Nubank_2026-07-28.csv',
      mesReferencia: '2026-07',
    });
    expect(upload.body.valores[0].inseridoEm).toBeDefined();

    const manualEntry = await request(app.getHttpServer())
      .post('/financial-entries')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ lugar: 'Farmácia', valor: 29.97, mesReferencia: '2026-07' });
    expect(manualEntry.status).toBe(201);
    expect(manualEntry.body).toMatchObject({
      lugar: 'Farmácia',
      valor: '29.97',
      origem: 'MANUAL',
      tipo: 'SAIDA',
      nomeArquivo: null,
      mesReferencia: '2026-07',
    });

    const entries = await request(app.getHttpServer())
      .get('/financial-entries')
      .query({ mesReferencia: '2026-07', pagina: 1, limite: 2 })
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(entries.status).toBe(200);
    expect(entries.body).toMatchObject({
      total: 3,
      pagina: 1,
      limite: 2,
      totalPaginas: 2,
    });
    expect(entries.body.items).toHaveLength(2);

    const importedEntries = await request(app.getHttpServer())
      .get('/financial-entries')
      .query({ origem: 'FILE' })
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(importedEntries.status).toBe(200);
    expect(importedEntries.body.total).toBe(2);

    const invalidEntriesQuery = await request(app.getHttpServer())
      .get('/financial-entries')
      .query({ mesReferencia: '07/2026' })
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(invalidEntriesQuery.status).toBe(400);

    const income = await request(app.getHttpServer())
      .post('/financial-entries')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({
        lugar: 'Salário',
        valor: 3500,
        tipo: 'ENTRADA',
        mesReferencia: '2026-07',
      });
    expect(income.status).toBe(201);
    expect(income.body).toMatchObject({
      lugar: 'Salário',
      valor: '3500.00',
      tipo: 'ENTRADA',
      origem: 'MANUAL',
    });

    const getIncome = await request(app.getHttpServer())
      .get(`/financial-entries/${income.body.id}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(getIncome.status).toBe(200);
    expect(getIncome.body.id).toBe(income.body.id);

    const updateIncome = await request(app.getHttpServer())
      .patch(`/financial-entries/${income.body.id}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ valor: 3600 });
    expect(updateIncome.status).toBe(200);
    expect(updateIncome.body).toMatchObject({ valor: '3600.00', tipo: 'ENTRADA' });

    const summary = await request(app.getHttpServer())
      .get('/financial-entries/summary')
      .query({ mesReferencia: '2026-07' })
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(summary.status).toBe(200);
    expect(summary.body).toEqual({
      mesReferencia: '2026-07',
      totalEntradas: '3600.00',
      totalSaidas: '135.47',
      saldo: '3464.53',
      quantidadeEntradas: 1,
      quantidadeSaidas: 3,
    });

    const deleteIncome = await request(app.getHttpServer())
      .delete(`/financial-entries/${income.body.id}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(deleteIncome.status).toBe(204);

    const deletedIncome = await request(app.getHttpServer())
      .get(`/financial-entries/${income.body.id}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(deletedIncome.status).toBe(404);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken });
    expect(refresh.status).toBe(200);

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ refreshToken: login.body.refreshToken });
    expect(logout.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
