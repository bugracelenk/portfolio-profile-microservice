import { ProfileController } from '@controllers/profile.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileRepository } from '@repositories/profile.repository';
import { Profile, ProfileSchema } from '@schemas/profile.schema';
import { ProfileService } from '@services/profile.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_URI),
    MongooseModule.forFeatureAsync([
      {
        name: Profile.name,
        useFactory: () => {
          const schema = ProfileSchema;
          schema.pre('save', function () {
            if (this.isNew) {
              this.id = this._id;
            }
          });
          return schema;
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_HOST],
          noAck: false,
          queue: 'USER_QUEUE',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
})
export class ProfileServiceModule {}
