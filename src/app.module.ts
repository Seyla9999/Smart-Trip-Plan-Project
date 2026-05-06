import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProvincesModule } from './provinces/provinces.module';
import { AttractionsModule } from './attractions/attractions.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Attraction } from './attractions/entities/attraction.entity';
import { Province } from './provinces/entities/province.entity';
import { PointsOfInterestModule } from './points-of-interest/points-of-interest.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CommunityStoriesModule } from './community-stories/community-stories.module';
import { AttractionImagesModule } from './attraction-images/attraction-images.module';
import { Review } from './reviews/entities/review.entity';
import { Story } from './community-stories/entities/story.entity';
import { StoryComment } from './community-stories/entities/story-comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadEntities: true,
      synchronize: false,
      entities: [Attraction, Province, Review, Story, StoryComment],

      ssl: {
        rejectUnauthorized: false,
      },
    }),

    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),

    AuthModule,
    ProvincesModule,
    AttractionsModule,
    PointsOfInterestModule,
    ReviewsModule,
    CommunityStoriesModule,
    AttractionImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

console.log('ENV CHECK:', process.env.DB_HOST);
