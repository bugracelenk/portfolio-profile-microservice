import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IUser } from 'src/interfaces/user.interface';

export type ProfileDocument = Profile & Document;

@Schema({ versionKey: false, timestamps: true })
export class Profile {
  id: string;

  @Prop({
    required: true,
    unique: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  firstName: string;

  @Prop({
    required: true,
  })
  lastName: string;

  @Prop({
    required: false,
    default: '',
  })
  bio: string;

  @Prop({
    required: false,
    default: '',
  })
  profileImage: string;

  user: IUser;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
