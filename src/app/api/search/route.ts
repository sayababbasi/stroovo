import { NextRequest, NextResponse } from 'next/server';
import { globalSearchEngine, SearchOptions } from '@/lib/search/global-search';

// GET /api/search - Perform global search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const teamId = searchParams.get('teamId');
    
    if (!query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Parse filters
    const filters: any = {};
    const type = searchParams.get('type');
    const spaceId = searchParams.get('spaceId');
    const author = searchParams.get('author');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');

    if (type) filters.type = type.split(',');
    if (spaceId) filters.spaceId = spaceId;
    if (author) filters.author = author;
    if (status) filters.status = status.split(',');
    if (priority) filters.priority = priority.split(',');
    if (dateStart && dateEnd) {
      filters.dateRange = { start: dateStart, end: dateEnd };
    }

    // Parse options
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const searchOptions: SearchOptions = {
      query,
      filters,
      limit,
      offset,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    };

    // Build search index if needed (in production, this would be cached)
    await globalSearchEngine.buildSearchIndex(teamId);

    // Perform search
    const results = await globalSearchEngine.search(searchOptions);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}

// POST /api/search - Rebuild search index
export async function POST(request: NextRequest) {
  try {
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Rebuild search index
    await globalSearchEngine.buildSearchIndex(teamId);

    return NextResponse.json({ message: 'Search index rebuilt successfully' });
  } catch (error) {
    console.error('Error rebuilding search index:', error);
    return NextResponse.json({ error: 'Failed to rebuild search index' }, { status: 500 });
  }
}
