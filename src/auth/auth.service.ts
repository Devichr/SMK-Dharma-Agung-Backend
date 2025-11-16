// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (user && await bcrypt.compare(password, user.password)) {
    const { password, ...result } = user;
    return result;
  }

  return null;
}

async login(payload: LoginDto) {
  const user = await this.validateUser(payload.email, payload.password);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const tokenPayload = { email: user.email, sub: user.id, role: user.role };
  const accessToken = this.jwtService.sign(tokenPayload);

  return {
    access_token: accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
  async register(payload: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
      },
    });

    const tokenPayload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}