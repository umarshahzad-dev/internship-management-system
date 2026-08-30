import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  user: UserResponseDto;
  sessionId?: string;
  csrfToken?: string;
  accessToken?: string;
  refreshToken?: string;
}
