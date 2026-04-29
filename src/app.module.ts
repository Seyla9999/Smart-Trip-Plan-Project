import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config' // Added ConfigService
import { AuthModule } from './modules/auth/auth.module'
import { MailerModule } from '@nestjs-modules/mailer'

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
  ],
})

export class AppModule {}
console.log('ENV CHECK:', process.env.DB_HOST)