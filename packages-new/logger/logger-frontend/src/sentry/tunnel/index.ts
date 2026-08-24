import { getEnvelopeEndpointWithUrlEncodedAuth, makeDsn, parseEnvelope } from '@sentry/core';

import { getSentryDsn, SENTRY_TUNNEL_CLIENT_DSN } from '../client/go-sentry.js';

function getSentryConfig(): Response {
	const dsn = getSentryDsn();

	if (!dsn) {
		return Response.json(
			{ error: 'Missing SENTRY_NEXTJS_DSN.' },
			{
				headers: noStoreHeaders(),
				status: 503,
			},
		);
	}

	return Response.json({ configured: true }, { headers: noStoreHeaders() });
}

async function forwardSentryEnvelope(request: Request): Promise<Response> {
	const dsn = getSentryDsn();

	if (!dsn) {
		return new Response('Tunnel not configured', { status: 503 });
	}

	const body = new Uint8Array(await request.arrayBuffer());
	let envelopeHeader: ReturnType<typeof parseEnvelope>[0];

	try {
		[envelopeHeader] = parseEnvelope(body);
	} catch {
		return new Response('Invalid envelope', { status: 400 });
	}

	if (envelopeHeader.dsn !== SENTRY_TUNNEL_CLIENT_DSN) {
		return new Response('DSN not allowed', { status: 403 });
	}

	const dsnComponents = makeDsn(dsn);
	if (!dsnComponents) {
		return new Response('Invalid Sentry DSN configuration', { status: 500 });
	}

	try {
		return await fetch(getEnvelopeEndpointWithUrlEncodedAuth(dsnComponents), {
			body: replaceEnvelopeDsn(body, dsn),
			headers: {
				'Content-Type': 'application/x-sentry-envelope',
			},
			method: 'POST',
		});
	} catch {
		return new Response('Failed to forward envelope to Sentry', { status: 502 });
	}
}

function replaceEnvelopeDsn(body: Uint8Array, dsn: string): Uint8Array {
	const headerEnd = body.indexOf(0x0A);
	if (headerEnd < 0) throw new Error('Invalid envelope header');

	const header = JSON.parse(new TextDecoder().decode(body.subarray(0, headerEnd))) as Record<string, unknown>;
	const serializedHeader = new TextEncoder().encode(`${JSON.stringify({ ...header, dsn })}\n`);
	const rewrittenBody = new Uint8Array(serializedHeader.length + body.length - headerEnd - 1);

	rewrittenBody.set(serializedHeader);
	rewrittenBody.set(body.subarray(headerEnd + 1), serializedHeader.length);

	return rewrittenBody;
}

function noStoreHeaders(): Record<string, string> {
	return {
		'Cache-Control': 'no-store, max-age=0',
	};
}

export {
	getSentryConfig as GET,
	forwardSentryEnvelope as POST,
};
