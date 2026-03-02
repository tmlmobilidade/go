import { DataProviders } from '@/providers/data-providers';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Line } from '@tmlmobilidade/types';
import { cookies } from 'next/headers';

async function fetchLine(id: string): Promise<{ data: Line }> {
	const url = API_ROUTES.offer.LINES_DETAIL(id);

	const res = await fetch(url, {
		cache: 'no-store',
		headers: {
			cookie: (await cookies()).toString(),
		},
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Failed to fetch line: ${res.status} ${res.statusText} | body=${body}`);
	}

	return res.json();
}

export default async function LineLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ id: string }>
}) {
	const { id } = await params;

	const { data: line } = await fetchLine(id);

	return (
		<DataProviders agency_id={line.agency_id}>
			{children}
		</DataProviders>
	);
}
