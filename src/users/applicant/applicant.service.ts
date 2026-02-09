import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

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

  // Accept applicant and create student record
  // ✅ LOGIC BARU: Tetap simpan applicant record, hanya buat student baru
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

    if (!applicant.userId) {
      throw new BadRequestException('Applicant is not linked to a user');
    }

    // Check if grade class exists
    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: gradeClassId },
    });

    if (!gradeClass) {
      throw new NotFoundException('Grade class not found');
    }

    // Check if student already exists for this user
    const existingStudent = await this.prisma.student.findUnique({
      where: { userId: applicant.userId },
    });

    if (existingStudent) {
      throw new BadRequestException('Student record already exists for this user');
    }

    // Use transaction to ensure data consistency
    return this.prisma.$transaction(async (tx) => {
      // 1. Update applicant status (TETAP SIMPAN APPLICANT RECORD)
      const updatedApplicant = await tx.applicant.update({
        where: { id: applicantId },
        data: {
          status: 'ACCEPTED',
          feedback: 'Selamat! Anda diterima sebagai siswa.',
        },
      });

      // 3. Create NEW student record (TIDAK HAPUS APPLICANT)
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
        message: 'Applicant successfully accepted and converted to student',
        applicant: updatedApplicant,
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

  /**
   * Resolve path dari DB ke path absolut di filesystem.
   * DB simpan path seperti "/uploads/applicant/file-xxx.png"
   * Kita gabungkan dengan process.cwd() untuk dapat path penuh.
   */
  private resolveFilePath(filePath: string | null): string | null {
    if (!filePath) return null;

    // Kalau sudah absolute path di filesystem, gunakan langsung
    if (filePath.startsWith('/') && existsSync(filePath)) {
      return filePath;
    }

    // Strip leading slash kalau ada, lalu gabungkan dengan cwd
    const relative = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const resolved = join(process.cwd(), relative);

    return existsSync(resolved) ? resolved : null;
  }

  // Generate PDF untuk applicant yang sudah diterima
  async generateRegistrationPDF(userId: number, res: Response) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    if (applicant.status !== 'ACCEPTED') {
      throw new BadRequestException('Only accepted applicants can download registration form');
    }

    // Resolve foto path sebelum mulai generate PDF
    const photoPath = this.resolveFilePath(applicant.photoFile);

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=formulir-pendaftaran-${applicant.nisn}.pdf`,
    );

    // Pipe PDF to response
    doc.pipe(res);

    // ─── HEADER SECTION ───────────────────────────────────────────
    // Layout: Judul di kiri, Foto di kanan
    const headerTopY = doc.y; // Y awal sebelum mulai nulis
    const photoSize = 100;    // Ukuran foto (width & height)
    const photoX = doc.page.width - doc.page.margins.right - photoSize; // X foto: flush ke kanan

    // Judul & subtitle di kiri
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('FORMULIR PENDAFTARAN SISWA BARU', {
        width: photoX - doc.page.margins.left - 20, // Sisakan ruang untuk foto
        align: 'center',
      });

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`NISN: ${applicant.nisn}`, {
        width: photoX - doc.page.margins.left - 20,
        align: 'center',
      })
      .text('Status: DITERIMA', {
        width: photoX - doc.page.margins.left - 20,
        align: 'center',
      });

    // Foto: gambar di kanan, atau kotak kosong kalau foto tidak ada
    if (photoPath) {
      doc.image(photoPath, photoX, headerTopY, {
        width: photoSize,
        height: photoSize,
      });
    } else {
      // Fallback: kotak kosong dengan label
      doc
        .save()
        .strokeColor('#cccccc')
        .lineWidth(1)
        .rect(photoX, headerTopY, photoSize, photoSize)
        .stroke()
        .restore();

      doc
        .save()
        .fillColor('#999999')
        .fontSize(8)
        .font('Helvetica')
        .text('Foto tidak tersedia', photoX, headerTopY + (photoSize / 2) - 6, {
          width: photoSize,
          align: 'center',
        })
        .restore();
    }

    // Geser Y ke bawah foto supaya konten berikutnya tidak bertabrakan
    doc.x = doc.page.margins.left;
    doc.y = headerTopY + photoSize + 20;
    // ─── END HEADER ───────────────────────────────────────────────

    // Data Pribadi
    doc.fontSize(14).font('Helvetica-Bold').text('A. DATA PRIBADI').moveDown(0.5);

    const personalData = [
      ['Nama Lengkap', applicant.name],
      ['NISN', applicant.nisn],
      ['No. Telepon', applicant.phone],
      ['Jenis Kelamin', applicant.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'],
      ['Tempat, Tanggal Lahir', `${applicant.birthPlace || '-'}, ${new Date(applicant.birthDate).toLocaleDateString('id-ID')}`],
      ['Golongan Darah', applicant.bloodType || '-'],
      ['Tinggi/Berat Badan', `${applicant.height || '-'} cm / ${applicant.weight || '-'} kg`],
      ['Hobi', applicant.hobby || '-'],
      ['Alamat Lengkap', applicant.fullAddress || applicant.address],
      ['Kode Pos', applicant.postalCode || '-'],
    ];

    doc.fontSize(10).font('Helvetica');
    let yPosition = doc.y;
    personalData.forEach(([label, value]) => {
      doc.text(`${label}`, 50, yPosition, { width: 180, continued: false });
      doc.text(`: ${value}`, 230, yPosition, { width: 320 });
      yPosition += 20;
    });

    doc.y = yPosition + 10;
    doc.moveDown(1);

    // Data Pendidikan
    doc.fontSize(14).font('Helvetica-Bold').text('B. DATA PENDIDIKAN').moveDown(0.5);

    const educationData = [
      ['Asal Sekolah', applicant.schoolOrigin],
      ['Nomor Ijazah', applicant.ijazahNumber || '-'],
      ['Tahun Ijazah', applicant.ijazahYear?.toString() || '-'],
      ['Nomor SKHUN', applicant.skhunNumber || '-'],
      ['Jurusan yang Diminati', applicant.desiredMajor || '-'],
    ];

    doc.fontSize(10).font('Helvetica');
    yPosition = doc.y;
    educationData.forEach(([label, value]) => {
      doc.text(`${label}`, 50, yPosition, { width: 180, continued: false });
      doc.text(`: ${value}`, 230, yPosition, { width: 320 });
      yPosition += 20;
    });

    doc.y = yPosition + 10;
    doc.moveDown(1);

    // Data Keluarga
    doc.fontSize(14).font('Helvetica-Bold').text('C. DATA KELUARGA').moveDown(0.5);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Tinggal Bersama: ${applicant.livingWith}`);
    doc.text(`Anak ke-: ${applicant.childPosition} dari ${applicant.totalSiblings} bersaudara`);
    doc.moveDown(0.5);

    if (applicant.livingWith === 'PARENTS') {
      const parentData = [
        ['Nama Ibu', applicant.motherName || '-'],
        ['Pekerjaan Ibu', applicant.motherOccupation || '-'],
        ['Penghasilan Ibu', applicant.motherIncome ? `Rp ${applicant.motherIncome.toLocaleString('id-ID')}` : '-'],
        ['Nama Ayah', applicant.fatherName || '-'],
        ['Pekerjaan Ayah', applicant.fatherOccupation || '-'],
        ['Penghasilan Ayah', applicant.fatherIncome ? `Rp ${applicant.fatherIncome.toLocaleString('id-ID')}` : '-'],
        ['No. Telepon Orang Tua', applicant.parentsPhone || '-'],
      ];

      yPosition = doc.y;
      parentData.forEach(([label, value]) => {
        doc.text(`${label}`, 50, yPosition, { width: 180, continued: false });
        doc.text(`: ${value}`, 230, yPosition, { width: 320 });
        yPosition += 20;
      });
      doc.y = yPosition;
    } else if (applicant.livingWith === 'GUARDIAN') {
      const guardianData = [
        ['Nama Wali', applicant.guardianName || '-'],
        ['Pekerjaan Wali', applicant.guardianOccupation || '-'],
        ['Alamat Wali', applicant.guardianAddress || '-'],
        ['No. Telepon Wali', applicant.guardianPhone || '-'],
        ['Penghasilan Wali', applicant.guardianIncome ? `Rp ${applicant.guardianIncome.toLocaleString('id-ID')}` : '-'],
      ];

      yPosition = doc.y;
      guardianData.forEach(([label, value]) => {
        doc.text(`${label}`, 50, yPosition, { width: 180, continued: false });
        doc.text(`: ${value}`, 230, yPosition, { width: 320 });
        yPosition += 20;
      });
      doc.y = yPosition;
    }

    doc.moveDown(1);

    // Prestasi
    if (applicant.achievements) {
      doc.fontSize(14).font('Helvetica-Bold').text('D. PRESTASI').moveDown(0.5);

      try {
        const achievements = typeof applicant.achievements === 'string'
          ? JSON.parse(applicant.achievements)
          : applicant.achievements;

        if (achievements && achievements.length > 0) {
          doc.fontSize(10).font('Helvetica');
          achievements.forEach((ach: any, idx: number) => {
            doc.text(`${idx + 1}. ${ach.title} (${ach.year})`);
            if (ach.description) {
              doc.text(`   ${ach.description}`);
            }
            doc.moveDown(0.3);
          });
        } else {
          doc.fontSize(10).font('Helvetica').text('Tidak ada prestasi');
        }
      } catch (e) {
        doc.fontSize(10).font('Helvetica').text('Tidak ada prestasi');
      }

      doc.moveDown(1);
    }

    // Footer
    doc.moveDown(2);

    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text(
        `Tanggal Pendaftaran: ${new Date(applicant.registeredAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`,
        { align: 'right' },
      )
      .moveDown(0.5)
      .text('Dokumen ini dibuat secara otomatis oleh sistem', { align: 'center' });

    // Finalize PDF
    doc.end();
  }
}