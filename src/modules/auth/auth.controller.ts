import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, UserService } from './auth.authService';
import { LoginDto, CreateUserDto } from './auth.dto';
import { AuthGuard, AdminGuard } from './auth.authGard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

//users controller

@ApiTags('Users')
@UseGuards(AdminGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user(only admin bearer accesstoekn can create users)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  async getUserById(@Param('id') id: string) {
    const userId = parseInt(id, 10);  // Parsing id to an integer
    return this.userService.getUserById(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    const userId = parseInt(id, 10);  // Parsing id to an integer
    return this.userService.updateUser(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Only admin can delete users' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async deleteUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);  // Parsing id to an integer
    return this.userService.deleteUser(userId);
  }

  // New endpoint to get all users, restricted to admins
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
