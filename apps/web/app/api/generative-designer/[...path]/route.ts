// =============================================================================
// apps/web/app/api/generative-designer/[...path]/route.ts
// Version corrigée pour Next.js 15 (params async)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL || 'http://localhost:8000';

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
    // Get JWT token from Supabase session
    const supabase = getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const jwtToken = session.access_token;

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