import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProfileCreateDto } from '@dtos/profile.create.dto';
import { ProfileUpdateDto } from '@dtos/profile.update.dto';
import { Profile, ProfileDocument } from '@schemas/profile.schema';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async createProfile(args: ProfileCreateDto): Promise<Profile> {
    return await this.profileModel.findOneAndUpdate(
      args,
      { $set: args },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async getProfileWithId(id: string): Promise<Profile> {
    return await this.profileModel.findById(id);
  }

  async getProfileWithUserId(userId: string): Promise<Profile> {
    return await this.profileModel.findOne({ userId });
  }

  async updateProfile(id: string, args: ProfileUpdateDto): Promise<Profile> {
    return await this.profileModel.findByIdAndUpdate(
      id,
      { $set: args },
      { upsert: true, new: true },
    );
  }
}
