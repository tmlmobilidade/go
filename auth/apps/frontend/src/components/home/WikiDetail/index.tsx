'use client';

import { ErrorDisplay, LoadingOverlay } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
/* * */

import { useParams } from 'next/navigation';
import useSWR from 'swr';

/* * */

interface ParsedMdxFile {
	_id: string
	html: string
	subtitle?: string
	tags: string[]
	title: string
}

export function WikiDetail() {
	//

	//
	// A. Setup Variables

	const params = useParams();
	const _id = params['id'];

	const { data, error: allError, isLoading: allLoading } = useSWR<ParsedMdxFile, Error>('http://localhost:52020/wiki/' + _id, swrFetcher);

	//
	// C. Render components

	if (allLoading) {
		return <LoadingOverlay />;
	}

	if (allError) {
		return <ErrorDisplay message={allError.message} />;
	}

	return (
		<div>
			<h1>{data.title}</h1>
			<h2>{data.subtitle}</h2>
			<div dangerouslySetInnerHTML={{ __html: data.html }} />
			<div>
				<strong>Tags:</strong> {data.tags.join(', ')}
			</div>
		</div>
	);
}
