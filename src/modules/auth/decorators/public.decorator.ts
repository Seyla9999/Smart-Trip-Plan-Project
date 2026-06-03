import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — bypasses the global JwtAuthGuard.
 * Usage: add @Public() above the route handler.
 *
 * Your JwtAuthGuard must honour this by checking:
 *   const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
 *     context.getHandler(),
 *     context.getClass(),
 *   ]);
 *   if (isPublic) return true;
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);