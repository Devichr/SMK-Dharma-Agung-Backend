import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

async validate(payload: any) {
  console.log('=== JWT PAYLOAD ===');
  console.log(payload);
  
  const user = { 
    userId: payload.sub, 
    email: payload.email, 
    role: payload.role,
    teacherId: payload.teacherId,
    adminId: payload.adminId,
    applicantId: payload.applicantId,
    studentId: payload.studentId,
  };
  
  console.log('=== RETURNING USER FROM JWT STRATEGY ===');
  console.log(user);
  
  return user;
}
}