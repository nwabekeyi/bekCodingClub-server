import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/service/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, CreateUserDto, FetchUserByEmailDto } from './auth.dto';
import { $Enums } from '@prisma/client';  // Import Prisma's enums

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Ensure role matches
    if (user.role !== role) {
      throw new UnauthorizedException('Invalid role for this user');
    }

    // Generate JWT token and return it directly
    const token = this.generateToken(user.id, user.email, user.role);

    // Return the access token
    return {
      access_token: token,
    };
  }

  // Generate JWT token with role-specific claims
  private generateToken(userId: number, email: string, role: $Enums.Role): string {
    const payload = { sub: userId, email, role };

    // Generate JWT token based on role
    let token: string;
    if (role === $Enums.Role.admin) {
      token = this.jwtService.sign(payload, { expiresIn: '1h' });
    } else if (role === $Enums.Role.student) {
      token = this.jwtService.sign(payload, { expiresIn: '30m' });
    } else {
      token = this.jwtService.sign(payload); // default token if needed for other roles
    }

    return token;
  }
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, role, firstName, lastName, phoneNumber, progress } = createUserDto;

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role, // Enum-based role
        firstName,
        lastName,
        phoneNumber,
        progress: progress ?? 0,
      },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }


  async updateUser(userId: number, updateUserDto: Partial<CreateUserDto>) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  // Function to get user by email using the DTO
  async getUserByEmail(fetchUserByEmailDto: FetchUserByEmailDto) {
    const { email } = fetchUserByEmailDto;
    return this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async deleteUser(userId: number) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // Logic to get all users
  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}
