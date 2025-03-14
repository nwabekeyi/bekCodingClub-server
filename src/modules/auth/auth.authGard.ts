import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log(request.headers)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // Attach the decoded user to the request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

@Injectable()
export class AdminGuard extends AuthGuard {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  canActivate(context: ExecutionContext): boolean {
    const isAuthenticated = super.canActivate(context);
    if (!isAuthenticated) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user has the admin role
    if (user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
