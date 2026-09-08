import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  user: UserResponseDto;
  csrfToken?: string;
  accessToken?: string;
  refreshToken?: string;
}
