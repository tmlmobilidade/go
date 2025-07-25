'use client';

/* * */

import { type WikiArticle } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, ErrorDisplay, LoadingOverlay, TagGroup } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

/* * */

export function WikiList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const columns: DataTableColumn<WikiArticle>[] = [
		{
			accessor: 'title',
			title: 'Título',
			width: 600,
		},
		{
			accessor: 'tags',
			render: item => <TagGroup limit={10} tags={item.tags.map(tag => ({ label: tag, variant: 'secondary' }))} />,
			title: 'Categorias',
			width: 500,
		},
	];

	//
	// B. Fetch data

	const { data: allWikiData, error: allWikiError, isLoading: allWikiLoading } = useSWR<WikiArticle[], Error>('/api/wiki', swrFetcher);

	//
	// C. Handle actions

	const handleRowClick = (item: WikiArticle) => {
		router.push(`/home/${item._id}`);
	};

	//
	// D. Render components

	if (allWikiLoading) {
		return <LoadingOverlay />;
	}

	if (allWikiError) {
		return <ErrorDisplay message={allWikiError.message} />;
	}

	return (
		<DataTable
			columns={columns}
			onRowClick={handleRowClick}
			records={allWikiData}
		/>
	);

	//
}
