'use client';

/* * */

import { ErrorDisplay, LoadingOverlay, Pane, Section, Text } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import { WikiHeader } from '../WikiHeader';

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
		<Pane header={[<WikiHeader />]}>
			<Section gap="md">
				<Text mb={20}>
					<h1>{data.title}</h1>
					<h3>{data.subtitle}</h3>
				</Text>

				<div dangerouslySetInnerHTML={{ __html: data.html }} />
				<Text>
					<br /><br />
					<div>
						<strong>Tags:</strong> {data.tags.join(' , ')}
					</div>
				</Text>
			</Section>
		</Pane>
	);
}
