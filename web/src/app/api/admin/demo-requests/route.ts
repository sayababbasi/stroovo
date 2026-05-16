import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AdminService } from '@/lib/services/AdminService';

export async function GET(request: Request) {
    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[GET /api/admin/demo-requests] Fetching demo requests for user:', userId);

        const { searchParams } = new URL(request.url);
        
        // Build filters manually
        const filters: any = {};
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        if (status && status !== 'ALL') filters.status = status;
        if (search) filters.search = search;

        console.log('[GET /api/admin/demo-requests] Filters:', filters);

        const requests = await AdminService.getDemoRequests(filters);
        console.log('[GET /api/admin/demo-requests] Returning requests:', requests.length);
        return NextResponse.json(requests);
    } catch (error: any) {
        console.error('[GET /api/admin/demo-requests] Error:', error);
        console.error('[GET /api/admin/demo-requests] Error stack:', error.stack);
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
