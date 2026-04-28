import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { ProvincesModule } from './modules/home/provinces/provinces.module';
import { AttractionsModule } from './modules/home/attractions/attractions.module';
import { StoriesModule } from './modules/home/stories/story.module';
import { SponsorsModule } from './modules/home/sponsors/sponsors.modules';
import { WeatherModule } from './modules/home/weather/weather.module';
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
    HttpModule,
    ProvincesModule,
    AttractionsModule,
    StoriesModule,
    SponsorsModule,
    WeatherModule,
  ],
})
export class AppModule {}
console.log('ENV CHECK:', process.env.DB_HOST);
