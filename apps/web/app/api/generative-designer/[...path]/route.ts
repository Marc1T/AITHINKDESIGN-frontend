// =============================================================================
// apps/web/app/api/generative-designer/[...path]/route.ts
// Version corrigée pour Next.js 15 (params async)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// Use server-side env variable (not exposed to client)
const BACKEND_URL = process.env.GENERATIVE_DESIGNER_BACKEND_URL || 'http://localhost:8000';

// IMPORTANT: Next.js 15 requires awaiting params
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }  // Changed to Promise
) {
  const params = await context.params;  // Await params
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }  // Changed to Promise
) {
  const params = await context.params;  // Await params
  return proxyRequest(request, params.path, 'POST');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }  // Changed to Promise
) {
  const params = await context.params;  // Await params
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Get JWT token from Supabase session (preferred)
    const supabase = getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Fallback: accept incoming Authorization header (useful for dev/testing)
    const incomingAuth = request.headers.get('authorization') || request.headers.get('Authorization');

    const jwtToken = session?.access_token || (incomingAuth ? incomingAuth.replace(/^Bearer\s+/i, '') : undefined);

    if (!jwtToken) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Build backend URL
    const path = pathSegments.join('/');
    const backendUrl = `${BACKEND_URL}/${path}`;

    console.log(`🔄 Proxying ${method} request to: ${backendUrl}`);

    // Prepare request options
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    };

    // Handle request body for POST/PATCH
    if (method === 'POST' || method === 'PATCH') {
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('multipart/form-data')) {
        // Forward FormData as-is
        const formData = await request.formData();
        options.body = formData as any;
        // Don't set Content-Type header, let fetch handle it
      } else if (contentType?.includes('application/json')) {
        // Forward JSON body
        try {
          const body = await request.json();
          options.body = JSON.stringify(body);
          (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
        } catch (e) {
          console.error('❌ Failed to parse JSON body:', e);
        }
      }
    }

    // Make request to backend
    const backendResponse = await fetch(backendUrl, options);

    console.log(`✅ Backend responded with status: ${backendResponse.status}`);

    // Fallback: if backend returned 404 and the incoming path included
    // the `/api/generative-designer` prefix, retry the request without it.
    if (backendResponse.status === 404) {
      if (pathSegments.length >= 2 && pathSegments[0] === 'api' && pathSegments[1] === 'generative-designer') {
        const strippedPath = pathSegments.slice(2).join('/');
        const retryUrl = `${BACKEND_URL}/${strippedPath}`;
        console.warn(`⚠️ Backend 404 for ${backendUrl}, retrying without prefix: ${retryUrl}`);

        const retryResponse = await fetch(retryUrl, options);
        console.log(`✅ Retry responded with status: ${retryResponse.status}`);

        if (retryResponse.headers.get('content-type')?.includes('application/pdf')) {
          const pdfBuffer = await retryResponse.arrayBuffer();
          return new NextResponse(pdfBuffer, {
            status: retryResponse.status,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': retryResponse.headers.get('content-disposition') || 'attachment',
            },
          });
        }

        const retryData = await retryResponse.json();
        return NextResponse.json(retryData, {
          status: retryResponse.status,
        });
      }
    }

    // Handle PDF responses
    if (backendResponse.headers.get('content-type')?.includes('application/pdf')) {
      const pdfBuffer = await backendResponse.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': backendResponse.headers.get('content-disposition') || 'attachment',
        },
      });
    }

    // Handle JSON responses
    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });

  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to communicate with backend',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}