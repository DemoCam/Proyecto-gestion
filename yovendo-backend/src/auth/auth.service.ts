import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/schemas/user.schema';

interface ValidatedUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: {
    name: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<ValidatedUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.status === UserStatus.ACTIVE) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user.toObject();
        return result as ValidatedUser;
      }
    }
    return null;
  }

  async login(user: ValidatedUser) {
    const payload = { email: user.email, sub: user._id, role: user.roleId.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.roleId.name,
      },
    };
  }
}
