import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BookmarksModule } from './modules/bookmarks/bookmarks.module'
import { AttractionsModule } from './modules/attractions/attractions.module'
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
    UsersModule,
    BookmarksModule,
    AttractionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
console.log('ENV CHECK:', process.env.DB_HOST)