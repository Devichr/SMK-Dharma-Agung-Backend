import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Multer } from'multer';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ApplicantService } from './applicant.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

// File upload configuration
const storage = diskStorage({
  destination: './uploads/applicants',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow images and PDFs
  if (
    file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException('Only image files (jpg, jpeg, png) and PDF are allowed'),
      false
    );
  }
};

@Controller('applicants')
export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}

  // ========================================
  // APPLICANT ROUTES (Authenticated)
  // ========================================

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('APPLICANT')
  async getMyProfile(@Request() req) {
    return this.applicantService.getMyProfile(req.user.id);
  }

  @Put('complete-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('APPLICANT')
  async completeProfile(@Request() req, @Body() dto: CompleteProfileDto) {
    return this.applicantService.completeProfile(req.user.id, dto);
  }

  @Post('upload/:documentType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('APPLICANT')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    })
  )
  async uploadDocument(
    @Request() req,
    @Param('documentType') documentType: string,
    @UploadedFile() file: Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const validTypes = ['sttb', 'skhun', 'birth_cert', 'photo', 'ijazah', 'achievement'];
    if (!validTypes.includes(documentType)) {
      throw new BadRequestException('Invalid document type');
    }

    return this.applicantService.uploadDocument(
      req.user.id,
      documentType,
      file.path
    );
  }

  @Delete('achievement-file/:index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('APPLICANT')
  async deleteAchievementFile(
    @Request() req,
    @Param('index', ParseIntPipe) index: number
  ) {
    return this.applicantService.deleteAchievementFile(req.user.id, index);
  }

  @Get('check-completion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('APPLICANT')
  async checkProfileCompletion(@Request() req) {
    return this.applicantService.checkProfileCompletion(req.user.id);
  }

  // ========================================
  // ADMIN ROUTES
  // ========================================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllApplicants(
    @Query('status') status?: 'PENDING' | 'ACCEPTED' | 'REJECTED',
    @Query('search') search?: string,
    @Query('desiredMajor') desiredMajor?: string
  ) {
    return this.applicantService.getAllApplicants({
      status,
      search,
      desiredMajor,
    });
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getStatistics() {
    return this.applicantService.getStatistics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getApplicantDetail(@Param('id', ParseIntPipe) id: number) {
    return this.applicantService.getApplicantDetail(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto
  ) {
    return this.applicantService.updateStatus(id, dto);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async acceptAndConvertToStudent(
    @Param('id', ParseIntPipe) applicantId: number,
    @Body('gradeClassId', ParseIntPipe) gradeClassId: number
  ) {
    return this.applicantService.acceptAndConvertToStudent(
      applicantId,
      gradeClassId
    );
  }
}