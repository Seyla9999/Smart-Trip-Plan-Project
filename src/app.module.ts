import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { ProvincesModule } from './modules/home/provinces/provinces.module';
import { AttractionsModule } from './modules/home/attractions/attractions.module';
import { StoriesModule } from './modules/home/stories/story.module';
import { SponsorsModule } from './modules/home/sponsors/sponsors.modules';
import { WeatherModule } from './modules/home/weather/weather.module';
import { ConfigModule, ConfigService } from '@nestjs/config' 
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BookmarksModule } from './modules/bookmarks/bookmarks.module'
import { UserPreferences } from './modules/users/user-preferences.entity'
import { Bookmark } from './modules/bookmarks/bookmark.entity'
import { Attraction } from './modules/attractions/attraction.entity'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'), 
          port: config.get('SMTP_PORT'), 
          secure: true, 
          auth: {
            user: config.get('SMTP_USER'), 
            pass: config.get('SMTP_PASS'), 
          },
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
    AttractionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
console.log('ENV CHECK:', process.env.DB_HOST);
