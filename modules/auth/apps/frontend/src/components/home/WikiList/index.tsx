'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
/* * */

import { type WikiArticle } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, ErrorDisplay, LoadingOverlay, TagGroup } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

export function WikiList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('translation', { keyPrefix: 'home' });

	const router = useRouter();

	const columns: DataTableColumn<WikiArticle>[] = [
		{
			accessor: 'title',
			title: t('tableHeaderTitle'),
			width: 600,
		},
		{
			accessor: 'tags',
			render: item => <TagGroup limit={10} tags={item.tags.map(tag => ({ label: tag, variant: 'secondary' }))} />,
			title: t('tableHeaderCategory'),
			width: 500,
		},
	];

	//
	// B. Fetch data

	const { data: allWikiData, error: allWikiError, isLoading: allWikiLoading } = useSWR<WikiArticle[], Error>(API_ROUTES.auth.WIKI_LIST);

	//
	// C. Handle actions

	const handleRowClick = (item: WikiArticle) => {
		router.push(PAGE_ROUTES.auth.HOME_DETAIL(item._id));
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
