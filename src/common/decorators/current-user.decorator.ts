import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadUser } from '../guards/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayloadUser => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
