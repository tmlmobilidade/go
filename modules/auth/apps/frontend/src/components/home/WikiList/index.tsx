'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
/* * */

import { type WikiArticle } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, ErrorDisplay, Label, LoadingOverlay, SearchInput, Section, Spacer, TagGroup, Toolbar, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

export function WikiList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const filterSearch = useFilterStateString('search');

	const columns: DataTableColumn<WikiArticle>[] = [
		{
			accessor: 'title',
			title: t('default:home.Wiki.list.columns.title.label'),
			width: 600,
		},
		{
			accessor: 'tags',
			render: item => <TagGroup limit={10} tags={item.tags.map(tag => ({ label: tag, variant: 'secondary' }))} />,
			title: t('default:home.Wiki.list.columns.category.label'),
			width: 500,
		},
	];

	//
	// B. Fetch data

	const { data: allWikiData, error: allWikiError, isLoading: allWikiLoading } = useSWR<WikiArticle[], Error>(API_ROUTES.auth.WIKI_LIST);

	const filteredWikiData = useSearch<WikiArticle>({
		accessors: ['title', 'tags', 'html'],
		data: allWikiData ?? [],
		query: filterSearch.value,
	});

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
		<Section gap="md" padding="lg">
			<Toolbar>
				<Label size="lg" caps singleLine>{t('default:home.Wiki.list.Header.title')}</Label>
				<Spacer />
				<SearchInput
					onChange={filterSearch.set}
					placeholder={t('default:home.Wiki.list.Header.SearchInput.placeholder')}
					value={filterSearch.value}
				/>
			</Toolbar>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={filteredWikiData}
			/>
		</Section>
	);

	//
}
