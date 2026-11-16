'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type BannerListItem } from '@tmlmobilidade/go-core-pckg-types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane, PublishStatusDisplay, UnixMillisecondsDisplay } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ListFilters } from '../../../shared/ListFilters';
import { useBannersDetailId } from '../../detail/use-banners-detail-id';
import { getBannerActivity } from '../../shared/banner-activity';
import { BANNER_SEVERITY_COLORS, BannerDisplayLabel, BannerKindIcon, BannerSeverityDot } from '../../shared/banner-display';
import { BannersListHeader } from '../BannersListHeader';
import { useBannersListData } from '../use-banners-list-data';

/* * */

export function BannersList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useBannersDetailId();
	const { data, error, isLoading } = useBannersListData();

	const columns: DataTableColumn<BannerListItem>[] = [
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
			accessor: 'publish_status',
			render: item => <PublishStatusDisplay value={item.publish_status} />,
			title: t('default:dev.fields.publication'),
			width: 130,
		},
		{
			accessor: 'activity',
			render: item => t(`default:dev.statuses.${getBannerActivity(item)}`),
			title: t('default:dev.fields.activity'),
			width: 120,
		},
		{
			accessor: 'severity',
			render: item => <BannerDisplayLabel color={BANNER_SEVERITY_COLORS[item.severity]} icon={<BannerSeverityDot severity={item.severity} />} label={t(`default:dev.severities.${item.severity}`)} />,
			title: t('default:dev.fields.severity'),
			width: 150,
		},
		{
			accessor: 'kind',
			render: item => <BannerDisplayLabel icon={<BannerKindIcon kind={item.kind} />} label={t(`default:dev.kinds.${item.kind}`)} />,
			title: t('default:dev.fields.kind'),
			width: 200,
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
			accessor: 'starts_at',
			render: item => item.starts_at && <UnixMillisecondsDisplay value={item.starts_at} showDate />,
			title: t('default:dev.fields.starts_at'),
			width: 180,
		},
		{
			accessor: 'ends_at',
			render: item => item.ends_at && <UnixMillisecondsDisplay value={item.ends_at} showDate />,
			title: t('default:dev.fields.ends_at'),
			width: 180,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: BannerListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.core.DEV_BANNERS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<BannersListHeader key="header" />, <ListFilters key="filters" />]}>
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
