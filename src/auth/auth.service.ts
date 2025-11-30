import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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

  // ============================================================
  // VALIDATE USER FOR LOGIN
  // ============================================================
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  // ============================================================
  // LOGIN
  // ============================================================
  async login(payload: LoginDto) {
    const user = await this.validateUser(payload.email, payload.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenPayload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      access_token: accessToken,
      user,
    };
  }

  // ============================================================
  // REGISTER (UPDATED)
  // ============================================================
  async register(payload: RegisterDto) {
    // Validasi email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Validasi field yang required berdasarkan role
    if (payload.role === Role.TEACHER) {
      if (!payload.nip) {
        throw new BadRequestException('NIP is required for TEACHER role');
      }
      
      // Check NIP sudah ada atau belum
      const existingTeacher = await this.prisma.teacher.findUnique({
        where: { nip: payload.nip },
      });
      if (existingTeacher) {
        throw new BadRequestException('NIP already exists');
      }
    }

    if (payload.role === Role.APPLICANT) {
      if (!payload.nisn || !payload.birthDate || !payload.schoolOrigin) {
        throw new BadRequestException(
          'NISN, birthDate, and schoolOrigin are required for APPLICANT role',
        );
      }
      
      // Check NISN sudah ada atau belum
      const existingApplicant = await this.prisma.applicant.findUnique({
        where: { nisn: payload.nisn },
      });
      if (existingApplicant) {
        throw new BadRequestException('NISN already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Gunakan transaction untuk memastikan data konsisten
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create user (HANYA email, password, role)
      const user = await tx.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          role: payload.role,
        },
      });

      // 2. Create profile berdasarkan role
      if (payload.role === Role.TEACHER) {
        await tx.teacher.create({
          data: {
            userId: user.id,
            name: payload.name,
            nip: payload.nip!,
            phone: payload.phone,
            address: payload.address,
          },
        });
      }

      if (payload.role === Role.APPLICANT) {
        await tx.applicant.create({
          data: {
            userId: user.id,
            name: payload.name,
            nisn: payload.nisn!,
            phone: payload.phone,
            address: payload.address,
            birthDate: new Date(payload.birthDate!),
            schoolOrigin: payload.schoolOrigin!,
          },
        });
      }

      if (payload.role === Role.ADMIN) {
        // Untuk ADMIN, buat entry di table Admin
        await tx.admin.create({
          data: {
            userId: user.id,
            name: payload.name,
            nip: payload.nip || `ADMIN-${user.id}`, // Generate NIP untuk admin jika tidak ada
          },
        });
      }

      return user;
    });

    // Generate JWT token
    const tokenPayload = {
      email: result.email,
      sub: result.id,
      role: result.role,
    };
    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      access_token: accessToken,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
    };
  }
}