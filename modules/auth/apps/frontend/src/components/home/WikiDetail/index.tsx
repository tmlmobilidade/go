'use client';

import { WikiDetailHeader } from '@/components/home/WikiDetailHeader';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type WikiArticle } from '@tmlmobilidade/types';
import { ErrorDisplay, LoadingOverlay, Pane, Section } from '@tmlmobilidade/ui';
import useSWR from 'swr';

/* * */

interface WikiDetailProps {
	id: string
}

/* * */

export function WikiDetail({ id }: WikiDetailProps) {
	//

	//
	// A. Setup Variables

	const { data: wikiArticleData, error: wikiArticleError, isLoading: wikiArticleLoading } = useSWR<WikiArticle, Error>(API_ROUTES.auth.WIKI_DETAIL(id));

	//
	// B. Render components

	if (wikiArticleLoading) {
		return <LoadingOverlay />;
	}

	if (wikiArticleError) {
		return <ErrorDisplay message={wikiArticleError.message} />;
	}

	return (
		<Pane header={[<WikiDetailHeader data={wikiArticleData} />]}>
			<Section>
				<div dangerouslySetInnerHTML={{ __html: wikiArticleData.html }} />
			</Section>
		</Pane>
	);

	//
}
