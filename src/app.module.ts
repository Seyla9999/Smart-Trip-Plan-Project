import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvincesModule } from './modules/provinces/provinces.module';
import { AttractionsModule } from './modules/attractions/attractions.module';
import { PointsOfInterestModule } from './points-of-interest/points-of-interest.module';
import { CommunityStoriesModule } from './community-stories/community-stories.module';
import { StoriesModule } from './modules/stories/stories.module';
import { AttractionImagesModule } from './attraction-images/attraction-images.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { NearbyImagesModule } from './nearby-images/nearby-images.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { WeatherModule } from './modules/weather/weather.module';
import { TripsModule } from './modules/trips/trips.module';

// Entities
import { Attraction } from './modules/attractions/attraction.entity';
import { Province } from './modules/provinces/province.entity';
import { Story } from './community-stories/entities/story.entity';
import { StoryComment } from './community-stories/entities/story-comment.entity';
import { Bookmark } from './modules/bookmarks/bookmark.entity';
import { NearbyImage } from './modules/nearby-images/nearby-image.entity';
import { UserPreferences } from './modules/users/user-preferences.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      entities: [Attraction, Province, Story, StoryComment, Bookmark, NearbyImage],

      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        options: `-c search_path=${process.env.DB_SCHEMA || 'public'}`,
      },
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host:   config.get('SMTP_HOST'),
          port:   parseInt(config.get('SMTP_PORT') || '587', 10),
          secure: config.get('SMTP_PORT') === '465',
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: {
          from: config.get('SMTP_FROM'),
        },
      }),
    }),

    AuthModule,
    HttpModule,
    ProvincesModule,
    AttractionsModule,
    StoriesModule,
    SponsorsModule,
    WeatherModule,
    UsersModule,
    BookmarksModule,
    TripsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}