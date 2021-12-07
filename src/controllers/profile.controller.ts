import { Controller, HttpStatus, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ProfileService } from '@services/profile.service';
import { ProfileCreateDto } from '@dtos/profile.create.dto';
import { sendAck } from '@helpers/sendAck';
import { ProfileResponse } from '@responses/profile.response';
import { Patterns } from '@patterns';
import { IUser } from 'src/interfaces/user.interface';
import { lastValueFrom } from 'rxjs';
import { ProfileUpdateDto } from '@dtos/profile.update.dto';

@Controller()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @MessagePattern(Patterns.CREATE_PROFILE)
  async createProfile(
    @Payload() args: ProfileCreateDto,
    @Ctx() context: RmqContext,
  ): Promise<ProfileResponse> {
    //get user data with the given userId
    const user = await this.userService.send<IUser>(Patterns.USER_GET_WITH_ID, {
      id: args.userId,
    });

    //if user not found return error
    if (!user) {
      sendAck(context);
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'USER_NOT_FOUND',
      };
    }

    //create profile
    const profile = await this.profileService.createProfile(args);
    //if profile not created return error
    if (!profile) {
      sendAck(context);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'PROFILE_CREATE_ERROR',
      };
    }

    //return created profile
    sendAck(context);
    return {
      status: HttpStatus.OK,
      profile,
    };
  }

  @MessagePattern(Patterns.GET_WITH_ID)
  async getProfileWithId(
    @Payload() { id }: { id: string },
    @Ctx() context: RmqContext,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfileWithId(id);
    if (!profile) {
      sendAck(context);
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'PROFILE_NOT_FOUND',
      };
    }

    sendAck(context);
    return {
      status: HttpStatus.OK,
      profile,
    };
  }

  @MessagePattern(Patterns.GET_WITH_USER_ID)
  async getProfileWithUserId(
    @Payload() { userId }: { userId: string },
    @Ctx() context: RmqContext,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfileWithUserId(userId);
    if (!profile) {
      sendAck(context);
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'PROFILE_NOT_FOUND',
      };
    }

    const user = await lastValueFrom(
      this.userService.send<IUser>(Patterns.USER_GET_WITH_ID, {
        id: profile.userId,
      }),
    );
    if (!user) {
      sendAck(context);
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'USER_SERVICE_NOT_FOUND_USER',
      };
    }

    profile.user = {
      email: user.email,
      username: user.username,
      id: user.id,
    };

    sendAck(context);
    return {
      status: HttpStatus.OK,
      profile,
    };
  }

  @MessagePattern(Patterns.UPDATE_PROFILE)
  async updateProfile(
    @Payload()
    {
      id,
      args,
      userId,
    }: { id: string; args: ProfileUpdateDto; userId: string },
    @Ctx() context: RmqContext,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfileWithId(id);
    if (!profile) {
      sendAck(context);
      return {
        status: HttpStatus.NOT_FOUND,
        error: 'USER_SERVICE_NOT_FOUND_USER',
      };
    }

    if (profile.userId !== userId) {
      sendAck(context);
      return {
        status: HttpStatus.FORBIDDEN,
        error: 'NOT_AUTHORIZED',
      };
    }

    const updatedProfile = await this.profileService.updateProfile(id, args);
    if (!updatedProfile) {
      sendAck(context);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'PROFILE_UPDATE_ERROR',
      };
    }

    sendAck(context);
    return {
      status: HttpStatus.OK,
      profile: updatedProfile,
    };
  }
}
