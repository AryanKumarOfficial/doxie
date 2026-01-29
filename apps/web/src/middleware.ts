import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {getToken} from 'next-auth/jwt';

// Public paths configuration
const PUBLIC_PATHS = new Set([
    '/',
    '/login',
    '/register',
    '/terms',
    '/privacy'
]);

const PUBLIC_API_PREFIXES = [
    '/api/auth',
    '/api/register',
    '/api/public'
];

const STATIC_FILE_REGEX = /\.(js|css|ico|png|jpg|jpeg|svg|webp|woff2)$/;

export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    // Skip middleware for static files and public paths
    if (
        STATIC_FILE_REGEX.test(pathname) ||
        PUBLIC_PATHS.has(pathname) ||
        PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))
    ) {
        return NextResponse.next();
    }

    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production'
        });

        // Handle missing token
        if (!token) {
            return handleUnauthenticated(request, pathname);
        }

        // Handle expired token
        if (isTokenExpired(token)) {
            return handleTokenExpired(request, pathname);
        }

        // Authenticated request - add security headers
        const response = NextResponse.next();
        setSecurityHeaders(response);
        return response;

    } catch (error) {
        console.error('Authentication Error:', error);
        return handleAuthError(request, pathname);
    }
}

// Helper functions
function isTokenExpired(token: any): boolean {
    return token.exp && (Date.now() >= token.exp * 1000);
}

function handleUnauthenticated(request: NextRequest, pathname: string) {
    if (pathname.startsWith('/api')) {
        return NextResponse.json(
            {error: 'Authentication required', code: 'UNAUTHORIZED'},
            {status: 401}
        );
    }

    return redirectToLogin(request, 'unauthenticated');
}

function handleTokenExpired(request: NextRequest, pathname: string) {
    if (pathname.startsWith('/api')) {
        return NextResponse.json(
            {error: 'Session expired', code: 'SESSION_EXPIRED'},
            {status: 401}
        );
    }

    return redirectToLogin(request, 'session_expired');
}

function handleAuthError(request: NextRequest, pathname: string) {
    if (pathname.startsWith('/api')) {
        return NextResponse.json(
            {error: 'Authentication service unavailable', code: 'AUTH_SERVICE_ERROR'},
            {status: 503}
        );
    }

    return redirectToLogin(request, 'error');
}

function redirectToLogin(request: NextRequest, reason: string) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    url.searchParams.set('reason', reason);
    return NextResponse.redirect(url);
}

function setSecurityHeaders(response: NextResponse) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );
    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
        '/api/:path*'
    ]
};