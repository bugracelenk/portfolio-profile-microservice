import { Profile } from '@schemas/profile.schema';

export type ProfileResponse = {
  status: number;
  error?: string;
  message?: string;
  profile?: Profile;
};
