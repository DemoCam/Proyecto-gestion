import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb+srv://Proyecto_Gestion:si2Tef1oPqQmktog@cluster0.uux2ndk.mongodb.net/yovendo_db?appName=Cluster0'),
    RolesModule,
    UsersModule,
    AuthModule,
    InventoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
