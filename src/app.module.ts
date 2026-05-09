import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { ProvincesModule } from './modules/home/provinces/provinces.module';
import { StoriesModule } from './modules/home/stories/story.module';
import { SponsorsModule } from './modules/home/sponsors/sponsors.modules';
import { WeatherModule } from './modules/home/weather/weather.module';
import { AttractionsModule } from './modules/home/attractions/attractions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { TripsModule } from './modules/trips/trips.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST'),
        port:     config.get<number>('DB_PORT') || 6543,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
      }),
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