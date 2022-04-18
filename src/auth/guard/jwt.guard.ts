import { AuthGuard } from '@nestjs/passport';

// 'jwt' is the strategy name
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
