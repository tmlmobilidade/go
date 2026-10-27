'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ChangelogReleaseListItem } from '@tmlmobilidade/go-core-pckg-types';
import { ChangelogItemCategoryValues } from '@tmlmobilidade/go-types-core';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane, PublishStatusDisplay, UnixMillisecondsDisplay } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ListFilters } from '../../../shared/ListFilters';
import { useChangelogDetailId } from '../../detail/use-changelog-detail-id';
import { ChangelogListHeader } from '../ChangelogListHeader';
import { useChangelogListData } from '../use-changelog-list-data';

/* * */

export function ChangelogList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useChangelogDetailId();
	const { data, error, isLoading } = useChangelogListData();

	const columns: DataTableColumn<ChangelogReleaseListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} copyOnClick />,
			title: t('default:dev.fields.id'),
			width: 90,
		},
		{
			accessor: 'title',
			render: item => item.title || t('default:dev.untitled'),
			title: t('default:dev.fields.title'),
			width: 260,
		},
		{
			accessor: 'status',
			render: item => <PublishStatusDisplay value={item.status} />,
			title: t('default:dev.fields.publication'),
			width: 130,
		},
		{
			accessor: 'scope',
			render: item => (item.scope.type === 'platform'
				? t('shared:components.changelog.modules.platform')
				: item.scope.module_ids.map(moduleId => t(`shared:components.changelog.modules.${moduleId}`)).join(', ')),
			title: t('default:dev.fields.scope'),
			width: 180,
		},
		{
			accessor: 'category_counts',
			render: item => ChangelogItemCategoryValues
				.map(category => `${t(`shared:components.changelog.categories.${category}`)}: ${item.category_counts[category]}`)
				.join(' · '),
			title: t('default:dev.fields.changes'),
			width: 340,
		},
		{
			accessor: 'published_at',
			render: item => item.published_at && <UnixMillisecondsDisplay value={item.published_at} showDate />,
			title: t('default:dev.fields.published_at'),
			width: 180,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: ChangelogReleaseListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.core.DEV_CHANGELOG_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<ChangelogListHeader key="header" />, <ListFilters key="filters" />]}>
			{error && <ErrorDisplay message={error} />}
			<DataTable
				columns={columns}
				isLoading={isLoading}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={id}
			/>
		</Pane>
	);
}
