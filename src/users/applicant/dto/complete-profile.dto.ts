import { IsString, IsOptional, IsInt, IsNumber, IsEnum, IsArray } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum LivingWith {
  PARENTS = 'PARENTS',
  GUARDIAN = 'GUARDIAN',
}

export class CompleteProfileDto {
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  birthPlace: string;

  @IsString()
  fullAddress: string;

  @IsString()
  postalCode: string;

  @IsString()
  @IsOptional()
  ijazahNumber?: string;

  @IsInt()
  @IsOptional()
  ijazahYear?: number;

  @IsString()
  @IsOptional()
  skhunNumber?: string;

  @IsString()
  desiredMajor: string; // IPA, IPS, Bahasa

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsInt()
  childPosition: number;

  @IsInt()
  totalSiblings: number;

  @IsString()
  @IsOptional()
  hobby?: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsEnum(LivingWith)
  livingWith: LivingWith;

  // Data Orang Tua (required jika livingWith = PARENTS)
  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherOccupation?: string;

  @IsString()
  @IsOptional()
  fatherOccupation?: string;

  @IsString()
  @IsOptional()
  parentsPhone?: string;

  @IsString()
  @IsOptional()
  fatherIncome?: string;

  @IsString()
  @IsOptional()
  motherIncome?: string;

  // Data Wali (required jika livingWith = GUARDIAN)
  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianOccupation?: string;

  @IsString()
  @IsOptional()
  guardianAddress?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  guardianIncome?: string;

  // Achievements (JSON)
  @IsArray()
  @IsOptional()
  achievements?: Array<{
    title: string;
    year: number;
    level: string; // "Sekolah", "Kabupaten", "Provinsi", "Nasional"
    description?: string;
  }>;
}