import { ProfileCreateDto } from '@dtos/profile.create.dto';
import { ProfileUpdateDto } from '@dtos/profile.update.dto';
import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '@repositories/profile.repository';
import { Profile } from '@schemas/profile.schema';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async createProfile(args: ProfileCreateDto): Promise<Profile> {
    return await this.profileRepository.createProfile(args);
  }

  async getProfileWithId(id: string): Promise<Profile> {
    return await this.profileRepository.getProfileWithId(id);
  }

  async getProfileWithUserId(userId: string): Promise<Profile> {
    return await this.profileRepository.getProfileWithUserId(userId);
  }

  async updateProfile(id: string, args: ProfileUpdateDto): Promise<Profile> {
    return await this.profileRepository.updateProfile(id, args);
  }
}
