import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, MinLength} from 'class-validator';
import { $Enums } from '@prisma/client';  // Import Prisma's enums

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'User role', enum: $Enums.Role, example: 'admin' })  // Use Prisma's Role enum
  @IsEnum($Enums.Role)
  role: $Enums.Role;
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User first name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'User phone number'})
  @IsString()
  token: string;

  @ApiProperty({ description: 'User progress percentage', default: 0.0 })
  @IsOptional()
  @IsString()
  progress?: number;

  @ApiProperty({ description: 'User role', enum: $Enums.Role, example: 'student' })  // Use Prisma's Role enum
  @IsEnum($Enums.Role)
  @IsNotEmpty()
  role: $Enums.Role;
}


export class FetchUserByEmailDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'The reset token received via email', example: 'jwt.token.here' })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @ApiProperty({ description: 'The new password', example: 'newpassword123' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

// New DTO for sending registration link
export class SendRegistrationLinkDto {
  @ApiProperty({ description: 'The email address of the user', example: 'user@example.com' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'The email address to send the reset link to', example: 'user@example.com' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}