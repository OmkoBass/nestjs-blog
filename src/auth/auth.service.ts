import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, verify } from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Hash the password and save the user
    const hashedPassword = await hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      // If prisma throws a constraint error

      if (error instanceof PrismaClientKnownRequestError) {
        // This is a prisma error code
        // documentation needs to be checked
        // for the available error codes
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials already taken.');
        }
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // If user with specified email is not found
    if (!user) {
      throw new ForbiddenException('Credentials incorrect.');
    }

    const matchedPassword = await verify(user.password, dto.password);

    // If passwords don't match throw
    if (!matchedPassword) {
      throw new ForbiddenException('Credentials incorrect.');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    id: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const data = {
      sub: id,
      email,
    };

    // Gets the secret key
    const secret = this.config.get('JWT_SECRET');

    // Signs our data
    // and returns a token
    const token = await this.jwt.signAsync(data, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
