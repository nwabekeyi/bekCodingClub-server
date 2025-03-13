import { IsEmail, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

//create user dto
export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;
}

//update user dto
export class UpdateUserDto extends PartialType(CreateUserDto) {}


//login user dto
export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    password: string;
  }


