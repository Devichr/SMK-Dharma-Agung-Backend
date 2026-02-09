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
  // Fetch user dengan relasi profile-nya sekalian
  const user = await this.prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      teacher: true,
      admin: true,
      applicant: true,
      student: true,
    },
  });

  if (!user || !(await bcrypt.compare(payload.password, user.password))) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Tentukan profile ID berdasarkan role
  const profileData: any = {};
  if (user.role === Role.TEACHER && user.teacher) {
    profileData.teacherId = user.teacher.id;
  } else if (user.role === Role.ADMIN && user.admin) {
    profileData.adminId = user.admin.id;
  } else if (user.role === Role.APPLICANT && user.applicant) {
    profileData.applicantId = user.applicant.id;
  } else if (user.role === Role.STUDENT && user.student) {
    profileData.studentId = user.student.id;
  }

  const tokenPayload = { 
    email: user.email, 
    sub: user.id, 
    role: user.role,
    ...profileData
  };
  
  const accessToken = this.jwtService.sign(tokenPayload);

  const { password, ...userWithoutPassword } = user;

  return {
    access_token: accessToken,
    user: {
      ...userWithoutPassword,
      ...profileData
    },
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

    let profileId: number | undefined;

    // 2. Create profile berdasarkan role dan simpan ID-nya
    if (payload.role === Role.TEACHER) {
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: payload.name,
          nip: payload.nip!,
          phone: payload.phone,
          address: payload.address,
        },
      });
      profileId = teacher.id;
    }

    if (payload.role === Role.APPLICANT) {
      const applicant = await tx.applicant.create({
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
      profileId = applicant.id;
    }

    if (payload.role === Role.ADMIN) {
      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          name: payload.name,
          nip: payload.nip || `ADMIN-${user.id}`,
        },
      });
      profileId = admin.id;
    }

    if (payload.role === Role.STUDENT) {
      // Jika ada logic untuk student registration
      const student = await tx.student.create({
        data: {
          userId: user.id,
          name: payload.name,
          nisn: payload.nisn!,
          phone: payload.phone,
          address: payload.address,
          birthDate: new Date(payload.birthDate!),
          schoolOrigin: payload.schoolOrigin!,
          enrollmentYear: new Date().getFullYear(),
        },
      });
      profileId = student.id;
    }

    return { user, profileId };
  });

  // Generate JWT token dengan profileId
  const profileData: any = {};
  if (result.profileId) {
    if (payload.role === Role.TEACHER) {
      profileData.teacherId = result.profileId;
    } else if (payload.role === Role.ADMIN) {
      profileData.adminId = result.profileId;
    } else if (payload.role === Role.APPLICANT) {
      profileData.applicantId = result.profileId;
    } else if (payload.role === Role.STUDENT) {
      profileData.studentId = result.profileId;
    }
  }

  const tokenPayload = {
    email: result.user.email,
    sub: result.user.id,
    role: result.user.role,
    ...profileData,  // Tambahkan teacherId/adminId/dll
  };
  
  const accessToken = this.jwtService.sign(tokenPayload);

  return {
    access_token: accessToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      ...profileData,  // Sertakan juga di response
    },
  };
}
}