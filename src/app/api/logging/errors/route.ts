import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { errorLogger } from '@/lib/logging/error-logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, message, context, metadata } = body;

    const logger = errorLogger(prisma);

    switch (level) {
      case 'ERROR':
        const error = new Error(message);
        if (body.stack) {
          error.stack = body.stack;
        }
        await logger.logError(error, context, metadata);
        break;
      
      case 'WARN':
        await logger.logWarning(message, context, metadata);
        break;
      
      case 'INFO':
        await logger.logInfo(message, context, metadata);
        break;
      
      default:
        await logger.logInfo(message, context, metadata);
    }

    return NextResponse.json({
      success: true,
      message: 'Error logged successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log error',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity');
    const timeRange = searchParams.get('timeRange') as '1h' | '6h' | '24h' | '7d' || '24h';

    const logger = errorLogger(prisma);
    
    if (searchParams.has('metrics')) {
      // Return error metrics
      const metrics = await logger.getErrorMetrics(timeRange);
      
      return NextResponse.json({
        metrics,
        timeRange,
        timestamp: new Date()
      });
    }

    // Return recent errors
    const errors = await logger.getRecentErrors(limit, severity || undefined);

    return NextResponse.json({
      errors,
      count: errors.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to get error logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve error logs',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { errorId, resolvedBy } = body;

    if (!errorId || !resolvedBy) {
      return NextResponse.json(
        {
          error: 'errorId and resolvedBy are required',
          timestamp: new Date()
        },
        { status: 400 }
      );
    }

    const logger = errorLogger(prisma);
    await logger.resolveError(errorId, resolvedBy);

    return NextResponse.json({
      success: true,
      message: 'Error marked as resolved',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to resolve error:', error);
    return NextResponse.json(
      {
        error: 'Failed to resolve error',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}
