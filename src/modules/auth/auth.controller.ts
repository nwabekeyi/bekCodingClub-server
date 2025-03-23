import { Controller, Req, Post, Body, Get, Param, Put, Delete, UseGuards, HttpCode, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, UserService } from './auth.authService';
import { LoginDto, CreateUserDto, FetchUserByEmailDto, ForgotPasswordDto, ResetPasswordDto, SendRegistrationLinkDto  } from './auth.dto';
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

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.sendResetPasswordLink(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('send-registration-link')
  @ApiOperation({ summary: 'Send registration confirmation link' })
  @ApiResponse({ status: 200, description: 'Registration link sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendRegistrationLink(@Body() sendRegistrationLinkDto: SendRegistrationLinkDto) {
    return this.authService.sendRegistrationLink(sendRegistrationLinkDto);
  }
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (only admin bearer access token can create users)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Any authenticated user
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  async getUserById(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    return this.userService.getUserById(userId);
  }

  @Get('email/:email')
  @UseGuards(AuthGuard) // Any authenticated user
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  async getUserByEmail(@Param('email') email: string, @Req() request: any) {
    const fetchUserByEmailDto: FetchUserByEmailDto = { email };
    const requestingUser = request.user; // From AuthGuard

    // Optional: Restrict students to their own email
    if (requestingUser.role === 'student' && requestingUser.email !== email) {
      throw new ForbiddenException('You can only fetch your own email');
    }

    return this.userService.getUserByEmail(fetchUserByEmailDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard) // Admin-only
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    const userId = parseInt(id, 10);
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard) // Admin-only
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Only admin can delete users' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async deleteUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    return this.userService.deleteUser(userId);
  }

  @Get()
  @UseGuards(AdminGuard) // Admin-only
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}