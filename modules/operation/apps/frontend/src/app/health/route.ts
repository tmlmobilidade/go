import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Next.js route handler export name
// eslint-disable-next-line @typescript-eslint/naming-convention
export function GET() {
	return NextResponse.json({ status: 'ok' }, { status: HTTP_STATUS.OK });
}
