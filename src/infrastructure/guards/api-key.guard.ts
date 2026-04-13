import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<
      Request & {
        headers: Record<string, string | string[] | undefined>;
        path?: string;
        url?: string;
      }
    >();

    const path = request.path ?? request.url ?? '';

    if (
      path.startsWith('/health') ||
      path.startsWith('/docs') ||
      path.startsWith('/docs-json')
    ) {
      return true;
    }

    const apiKey = request.headers['x-api-key'];
    const expected = process.env.API_KEY;
    const provided = Array.isArray(apiKey) ? apiKey[0] : apiKey;

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
