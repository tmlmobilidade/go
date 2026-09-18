/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { NextResponse } from 'next/server';

/* * */

export const dynamic = 'force-dynamic';

export const GET = () => NextResponse.json({ status: 'ok' }, { status: HTTP_STATUS.OK });
