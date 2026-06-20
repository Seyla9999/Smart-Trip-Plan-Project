import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { BookmarksController } from '../src/bookmarks/bookmarks.controller';
import { BookmarksService } from '../src/bookmarks/bookmarks.service';
import { TripsController } from '../src/modules/trips/trips.controller';
import { TripsService } from '../src/modules/trips/trips.service';
import { AttractionsController } from '../src/modules/attractions/attractions.controller';
import { AttractionsService } from '../src/modules/attractions/attractions.service';
import { PlacesController } from '../src/modules/places/places.controller';
import { PlacesService } from '../src/modules/places/places.service';
import { ProvincesController } from '../src/modules/provinces/provinces.controller';
import { ProvincesService } from '../src/modules/provinces/provinces.service';
import { WeatherController } from '../src/modules/weather/weather.controller';
import { WeatherService } from '../src/modules/weather/weather.service';
import { CommunityStoriesController } from '../src/community-stories/community-stories.controller';
import { CommunityStoriesService } from '../src/community-stories/community-stories.service';
import { StoriesController } from '../src/modules/stories/stories.controller';
import { StoriesService } from '../src/modules/stories/stories.service';
import { ChatController } from '../src/modules/chat/chat.controller';
import { ChatService } from '../src/modules/chat/chat.service';
import { SponsorsController } from '../src/modules/sponsors/sponsors.controller';
import { SponsorsService } from '../src/modules/sponsors/sponsors.service';
import { UsersController } from '../src/modules/users/user.controller';
import { UsersService } from '../src/modules/users/users.service';
import { ReviewsController } from '../src/modules/reviews/reviews.controller';
import { ReviewsService } from '../src/modules/reviews/reviews.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('API (e2e) expanded smoke tests', () => {
  let app: INestApplication;

  const mockAuthGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: '00000000-0000-0000-0000-000000000000' };
      return true;
    },
  };

  const appService = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
  };

  const authService = {
    login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    register: jest.fn().mockResolvedValue({ success: true }),
    verify: jest.fn().mockResolvedValue({ success: true }),
    resendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
    forgotPassword: jest.fn().mockResolvedValue({ success: true }),
    verifyForgotPassword: jest.fn().mockResolvedValue({ success: true }),
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
  };

  const bookmarksService = {
    findByUser: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const tripsService = {
    findAll: jest.fn().mockResolvedValue([]),
    canReview: jest.fn().mockResolvedValue(true),
  };

  const attractionsService = {
    getCategories: jest.fn().mockResolvedValue([]),
    getStatistics: jest.fn().mockResolvedValue({}),
    findByCategory: jest.fn().mockResolvedValue([]),
    findByProvince: jest.fn().mockResolvedValue([]),
    findTopRated: jest.fn().mockResolvedValue([]),
    findHiddenGems: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    seedTataiWaterfall: jest.fn().mockResolvedValue({}),
  };

  const placesService = {
    nearbySearch: jest.fn().mockResolvedValue([]),
    getPhotoStream: jest.fn(),
    getDetails: jest.fn().mockResolvedValue({}),
  };

  const provincesService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
  };

  const weatherService = {
    getAll: jest.fn().mockResolvedValue([]),
    getByProvince: jest.fn().mockResolvedValue({}),
  };

  const communityStoriesService = {
    findAll: jest.fn().mockResolvedValue([]),
    getStats: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    getComments: jest.fn().mockResolvedValue([]),
    addComment: jest.fn().mockResolvedValue({}),
    toggleLike: jest.fn().mockResolvedValue({}),
  };

  const storiesService = {
    findAll: jest.fn().mockResolvedValue([]),
    updateStatus: jest.fn().mockResolvedValue({}),
  };

  const chatService = {
    pingLastSeen: jest.fn().mockResolvedValue({ success: true }),
    getOnlineStatus: jest.fn().mockResolvedValue({ online: true }),
    getConversations: jest.fn().mockResolvedValue([]),
    getTotalUnread: jest.fn().mockResolvedValue(0),
    getTripConversation: jest.fn().mockResolvedValue({}),
    getMessages: jest.fn().mockResolvedValue([]),
    getConversationById: jest.fn().mockResolvedValue({}),
    joinConversation: jest.fn().mockResolvedValue({}),
    leaveConversation: jest.fn().mockResolvedValue({}),
    removeMember: jest.fn().mockResolvedValue({}),
    updateConversation: jest.fn().mockResolvedValue({}),
    createConversation: jest.fn().mockResolvedValue({}),
    sendMessage: jest.fn().mockResolvedValue({}),
    updateMessageStatus: jest.fn().mockResolvedValue({}),
    markConversationSeen: jest.fn().mockResolvedValue({}),
    addMember: jest.fn().mockResolvedValue({}),
    deleteMessage: jest.fn().mockResolvedValue({}),
    markRead: jest.fn().mockResolvedValue({}),
  };

  const sponsorsService = {
    findAllActive: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  };

  const usersService = {
    countAll: jest.fn().mockResolvedValue(0),
    searchUsers: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: '123', username: 'user' }),
    getNotifications: jest.fn().mockResolvedValue([]),
    markNotificationsRead: jest.fn().mockResolvedValue({ success: true }),
    getUserStories: jest.fn().mockResolvedValue([]),
    updateProfile: jest.fn().mockResolvedValue({}),
    changePassword: jest.fn().mockResolvedValue({ success: true }),
    deleteAccount: jest.fn().mockResolvedValue({ success: true }),
  };

  const reviewsService = {
    create: jest.fn().mockResolvedValue({}),
    findAll: jest.fn().mockResolvedValue([]),
    findByAttraction: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        AuthController,
        BookmarksController,
        TripsController,
        AttractionsController,
        PlacesController,
        ProvincesController,
        WeatherController,
        CommunityStoriesController,
        StoriesController,
        ChatController,
        SponsorsController,
        UsersController,
        ReviewsController,
      ],
      providers: [
        { provide: AppService, useValue: appService },
        { provide: AuthService, useValue: authService },
        { provide: BookmarksService, useValue: bookmarksService },
        { provide: TripsService, useValue: tripsService },
        { provide: AttractionsService, useValue: attractionsService },
        { provide: PlacesService, useValue: placesService },
        { provide: ProvincesService, useValue: provincesService },
        { provide: WeatherService, useValue: weatherService },
        { provide: CommunityStoriesService, useValue: communityStoriesService },
        { provide: StoriesService, useValue: storiesService },
        { provide: ChatService, useValue: chatService },
        { provide: SponsorsService, useValue: sponsorsService },
        { provide: UsersService, useValue: usersService },
        { provide: ReviewsService, useValue: reviewsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/hello should return Hello World!', () => {
    return request(app.getHttpServer())
      .get('/api/hello')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/auth/login should return a token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201)
      .expect({ access_token: 'token' });
  });

  it('/api/bookmarks should return 200 for authenticated user', async () => {
    await request(app.getHttpServer())
      .get('/api/bookmarks')
      .query({ userId: '00000000-0000-0000-0000-000000000000' })
      .expect(200)
      .expect({ data: [] });
  });

  it('/api/trips should return 200 for authenticated user', async () => {
    await request(app.getHttpServer())
      .get('/api/trips')
      .expect(200)
      .expect([]);
  });

  it('/api/attractions/categories should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/attractions/categories')
      .expect(200)
      .expect({ categories: [] });
  });

  it('/api/places should return 200 for authenticated user', async () => {
    await request(app.getHttpServer())
      .get('/api/places')
      .query({ lat: 10, lng: 10 })
      .expect(200)
      .expect([]);
  });

  it('/api/provinces should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/provinces')
      .expect(200)
      .expect([]);
  });

  it('/api/weather should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/weather')
      .expect(200)
      .expect([]);
  });

  it('/api/community/stats should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/community/stats')
      .expect(200)
      .expect({});
  });

  it('/api/stories/stats should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/stories/stats')
      .expect(200)
      .expect({});
  });

  it('/api/chat/ping should return 200', async () => {
    await request(app.getHttpServer())
      .put('/api/chat/ping')
      .send({ userId: '00000000-0000-0000-0000-000000000000' })
      .expect(200)
      .expect({ success: true });
  });

  it('/api/chat/online-status/:userId should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/chat/online-status/00000000-0000-0000-0000-000000000000')
      .expect(200)
      .expect({ online: true });
  });

  it('/api/chat/conversations should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/chat/conversations')
      .query({ userId: '00000000-0000-0000-0000-000000000000' })
      .expect(200)
      .expect([]);
  });

  it('/api/sponsors should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/sponsors')
      .expect(200)
      .expect([]);
  });

  it('/api/sponsors/save should return 201', async () => {
    await request(app.getHttpServer())
      .post('/api/sponsors/save')
      .send({ name: 'Test Sponsor' })
      .expect(201)
      .expect({});
  });

  it('/api/users/count should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/users/count')
      .expect(200)
      .expect({ success: true, count: 0 });
  });

  it('/api/users/search should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/users/search')
      .query({ q: 'test' })
      .expect(200)
      .expect([]);
  });

  it('/api/users/:id should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/users/123')
      .expect(200)
      .expect({ success: true, data: { id: '123', username: 'user' } });
  });

  it('/api/reviews should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/reviews')
      .expect(200)
      .expect([]);
  });

  it('/api/reviews/attraction/:id should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/reviews/attraction/att-1')
      .expect(200)
      .expect([]);
  });

  it('/api/reviews should create review when authorized', async () => {
    await request(app.getHttpServer())
      .post('/api/reviews')
      .send({ attraction_id: 'att-1', rating: 5, comment: 'Great' })
      .expect(201)
      .expect({});
  });
});
