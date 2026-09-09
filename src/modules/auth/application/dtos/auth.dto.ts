import { IsEmail, IsJWT, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshTokenDto {
  @IsJWT()
  refreshToken!: string;
}

export class LogoutDto {
  @IsJWT()
  refreshToken!: string;
}
