import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
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