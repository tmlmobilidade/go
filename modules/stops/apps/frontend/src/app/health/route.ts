/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { NextResponse } from 'next/server';

/* * */

export function GET() {
	return NextResponse.json({ status: 'ok' }, { status: HTTP_STATUS.OK });
}
