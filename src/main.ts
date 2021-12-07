import { ProfileServiceModule } from '@appmodule';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProfileServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_HOST],
        queue: 'PROFILE_QUEUE',
        noAck: false,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
