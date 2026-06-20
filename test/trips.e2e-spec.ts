import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { TripsController } from './../src/modules/trips/trips.controller';
import { TripsService } from './../src/modules/trips/trips.service';
import { JwtAuthGuard } from './../src/modules/auth/guards/jwt-auth.guard';

describe('TripsController (e2e) POST /trips', () => {
  let app: INestApplication;
  const mockTrip = { id: 'trip-1', title: 'Test Trip', invite_token: 'token' };
  const tripsService = { create: jest.fn().mockResolvedValue(mockTrip) };

  beforeAll(async () => {
    const mockAuthGuard: CanActivate = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'user-1' };
        return true;
      },
    };

    const moduleBuilder = Test.createTestingModule({
      controllers: [TripsController],
      providers: [{ provide: TripsService, useValue: tripsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard);

    const moduleRef: TestingModule = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a trip and returns 201', async () => {
    const payload = { title: 'My Trip', description: 'desc' };

    const res = await request(app.getHttpServer())
      .post('/api/trips')
      .send(payload)
      .expect(201);

    expect(tripsService.create).toHaveBeenCalledWith('user-1', payload);
    expect(res.body).toEqual(mockTrip);
  });
});
