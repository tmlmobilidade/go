import { type NextRequest, NextResponse } from 'next/server';

/* * */

const DEFAULT_MOTIS_API_BASE_URL = 'http://localhost:8080';

/* * */

interface MotisProxyRouteContext {
	params: Promise<{
		path: string[]
	}>
}

/* * */

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function GET(request: NextRequest, context: MotisProxyRouteContext) {
	//

	//
	// A. Setup variables

	const { path } = await context.params;
	const baseUrl = (process.env.MOTIS_API_BASE_URL || DEFAULT_MOTIS_API_BASE_URL).replace(/\/$/, '');
	const upstreamUrl = new URL(`${baseUrl}/${path.map(segment => encodeURIComponent(segment)).join('/')}`);

	request.nextUrl.searchParams.forEach((value, key) => {
		upstreamUrl.searchParams.append(key, value);
	});

	//
	// B. Fetch data

	try {
		const upstreamResponse = await fetch(upstreamUrl, {
			cache: 'no-store',
			headers: {
				accept: request.headers.get('accept') || 'application/json',
			},
		});

		const responseHeaders = new Headers();
		const contentType = upstreamResponse.headers.get('content-type');
		if (contentType) responseHeaders.set('content-type', contentType);

		return new NextResponse(await upstreamResponse.arrayBuffer(), {
			headers: responseHeaders,
			status: upstreamResponse.status,
			statusText: upstreamResponse.statusText,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown MOTIS proxy error';
		return NextResponse.json({ error: message }, { status: 502 });
	}

	//
}
