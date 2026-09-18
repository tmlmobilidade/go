/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { NextResponse } from 'next/server';

/* * */

export const dynamic = 'force-dynamic';

/* * */

function getHealth() {
	return NextResponse.json({ status: 'ok' }, { status: HTTP_STATUS.OK });
}

export const GET = getHealth;
