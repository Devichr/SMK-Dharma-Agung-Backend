import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ApplicantService {
  constructor(private prisma: PrismaService) {}

  // Get applicant by userId
  async getMyProfile(userId: number) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return applicant;
  }

  // Complete profile after registration
  async completeProfile(userId: number, dto: CompleteProfileDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    // Validate: jika livingWith = PARENTS, data orang tua harus ada
    if (dto.livingWith === 'PARENTS') {
      if (!dto.motherName || !dto.fatherName) {
        throw new BadRequestException(
          'Mother and father names are required when living with parents',
        );
      }
    }

    // Validate: jika livingWith = GUARDIAN, data wali harus ada
    if (dto.livingWith === 'GUARDIAN') {
      if (!dto.guardianName) {
        throw new BadRequestException(
          'Guardian name is required when living with guardian',
        );
      }
    }

    // Update profile
    return this.prisma.applicant.update({
      where: { userId },
      data: {
        gender: dto.gender,
        birthPlace: dto.birthPlace,
        fullAddress: dto.fullAddress,
        postalCode: dto.postalCode,
        ijazahNumber: dto.ijazahNumber,
        ijazahYear: dto.ijazahYear,
        skhunNumber: dto.skhunNumber,
        desiredMajor: dto.desiredMajor,
        bloodType: dto.bloodType,
        childPosition: dto.childPosition,
        totalSiblings: dto.totalSiblings,
        hobby: dto.hobby,
        height: dto.height,
        weight: dto.weight,
        achievements: dto.achievements
          ? JSON.stringify(dto.achievements)
          : null,
        livingWith: dto.livingWith,
        motherName: dto.motherName,
        fatherName: dto.fatherName,
        motherOccupation: dto.motherOccupation,
        fatherOccupation: dto.fatherOccupation,
        parentsPhone: dto.parentsPhone,
        fatherIncome: dto.fatherIncome,
        motherIncome: dto.motherIncome,
        guardianName: dto.guardianName,
        guardianOccupation: dto.guardianOccupation,
        guardianAddress: dto.guardianAddress,
        guardianPhone: dto.guardianPhone,
        guardianIncome: dto.guardianIncome,
      },
    });
  }

  // Upload documents
  async uploadDocument(userId: number, documentType: string, filePath: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    const updateData: any = {};

    switch (documentType) {
      case 'sttb':
        updateData.sttbFile = filePath;
        break;
      case 'skhun':
        updateData.skhunFile = filePath;
        break;
      case 'birth_cert':
        updateData.birthCertFile = filePath;
        break;
      case 'photo':
        updateData.photoFile = filePath;
        break;
      case 'ijazah':
        updateData.ijazahFile = filePath;
        break;
      case 'achievement':
        // For achievements, we store array of paths
        const currentFiles = (applicant.achievementFiles as string[]) || [];
        updateData.achievementFiles = [...currentFiles, filePath];
        break;
      default:
        throw new BadRequestException('Invalid document type');
    }

    return this.prisma.applicant.update({
      where: { userId },
      data: updateData,
    });
  }

  // Delete achievement file
  async deleteAchievementFile(userId: number, fileIndex: number) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    const currentFiles = (applicant.achievementFiles as string[]) || [];

    if (fileIndex < 0 || fileIndex >= currentFiles.length) {
      throw new BadRequestException('Invalid file index');
    }

    currentFiles.splice(fileIndex, 1);

    return this.prisma.applicant.update({
      where: { userId },
      data: {
        achievementFiles: currentFiles,
      },
    });
  }

  // Check if profile is complete
  async checkProfileCompletion(userId: number) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    const requiredFields = [
      'gender',
      'birthPlace',
      'fullAddress',
      'postalCode',
      'desiredMajor',
      'childPosition',
      'totalSiblings',
      'livingWith',
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!applicant[field]) {
        missingFields.push(field);
      }
    }

    // Check parent/guardian data based on livingWith
    if (applicant.livingWith === 'PARENTS') {
      if (!applicant.motherName) missingFields.push('motherName');
      if (!applicant.fatherName) missingFields.push('fatherName');
    } else if (applicant.livingWith === 'GUARDIAN') {
      if (!applicant.guardianName) missingFields.push('guardianName');
    }

    // Check required documents
    const requiredDocs = [
      'sttbFile',
      'skhunFile',
      'birthCertFile',
      'photoFile',
      'ijazahFile',
    ];
    const missingDocs: string[] = [];

    for (const doc of requiredDocs) {
      if (!applicant[doc]) {
        missingDocs.push(doc);
      }
    }

    const isComplete = missingFields.length === 0 && missingDocs.length === 0;

    return {
      isComplete,
      missingFields,
      missingDocuments: missingDocs,
      completionPercentage: Math.round(
        ((requiredFields.length +
          requiredDocs.length -
          missingFields.length -
          missingDocs.length) /
          (requiredFields.length + requiredDocs.length)) *
          100,
      ),
    };
  }

  // ========================================
  // ADMIN FUNCTIONS
  // ========================================

  // Get all applicants (for admin)
  async getAllApplicants(filters?: {
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    search?: string;
    desiredMajor?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.desiredMajor) {
      where.desiredMajor = filters.desiredMajor;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nisn: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.applicant.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });
  }

  // Get applicant detail (for admin)
  async getApplicantDetail(id: number) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return applicant;
  }

  // Update applicant status (for admin)
  async updateStatus(id: number, dto: UpdateStatusDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status: dto.status,
        feedback: dto.feedback,
      },
    });
  }

  // Accept applicant and convert to student
  async acceptAndConvertToStudent(applicantId: number, gradeClassId: number) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: { user: true },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.status === 'ACCEPTED') {
      throw new BadRequestException('Applicant already accepted');
    }

    // Check if grade class exists
    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: gradeClassId },
    });

    if (!gradeClass) {
      throw new NotFoundException('Grade class not found');
    }

    // Use transaction to ensure data consistency
    return this.prisma.$transaction(async (tx) => {
      // Update applicant status
      await tx.applicant.update({
        where: { id: applicantId },
        data: {
          status: 'ACCEPTED',
          feedback: 'Selamat! Anda diterima sebagai siswa.',
        },
      });

      if (!applicant.userId) {
        throw new BadRequestException('Applicant is not linked to a user');
      }

      // Update user role to STUDENT
      await tx.user.update({
        where: { id: applicant.userId },
        data: {
          role: 'STUDENT',
        },
      });

      // Create student record
      const student = await tx.student.create({
        data: {
          name: applicant.name,
          nisn: applicant.nisn,
          phone: applicant.phone,
          address: applicant.fullAddress || applicant.address,
          birthDate: applicant.birthDate,
          schoolOrigin: applicant.schoolOrigin,
          enrollmentYear: new Date().getFullYear(),
          userId: applicant.userId,
          gradeClassId,
        },
      });

      return {
        message: 'Applicant successfully converted to student',
        student,
      };
    });
  }

  // Get statistics (for admin dashboard)
  async getStatistics() {
    const [total, pending, accepted, rejected] = await Promise.all([
      this.prisma.applicant.count(),
      this.prisma.applicant.count({ where: { status: 'PENDING' } }),
      this.prisma.applicant.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.applicant.count({ where: { status: 'REJECTED' } }),
    ]);

    // Count by desired major
    const byMajor = await this.prisma.applicant.groupBy({
      by: ['desiredMajor'],
      _count: true,
      where: {
        desiredMajor: { not: null },
      },
    });

    return {
      total,
      pending,
      accepted,
      rejected,
      byMajor: byMajor.map((m) => ({
        major: m.desiredMajor,
        count: m._count,
      })),
    };
  }
}
