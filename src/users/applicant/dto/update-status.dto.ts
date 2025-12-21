import { IsEnum, IsString, IsOptional } from "class-validator";

export class UpdateStatusDto {
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED'])
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  @IsString()
  @IsOptional()
  feedback?: string;
}
