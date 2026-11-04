'use client';

import { ZonesListFiltersBar } from '@/components/zones/list/filters/ZonesListFiltersBar';
import { ZonesListCellAgencies } from '@/components/zones/list/ZonesListCellAgencies';
import { ZonesListHeader } from '@/components/zones/list/ZonesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Zone } from '@tmlmobilidade/go-types-offer';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useZonesDetailZoneId } from '../../detail/use-zones-detail-zone-id';
import { useZonesListData } from '../use-zones-list-data';

/* * */

export function ZonesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data, error, isLoading } = useZonesListData();
	const { zoneId } = useZonesDetailZoneId();
	const { t } = useTranslation();

	const columns: DataTableColumn<Zone>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:zones.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'code',
			render: item => <Text>{item.code}</Text>,
			title: t('default:zones.list.columns.code'),
			width: 200,
		},
		{
			accessor: 'name',
			render: item => <Text>{item.name}</Text>,
			title: t('default:zones.list.columns.name'),
			width: 300,
		},
		{
			accessor: 'agency_ids',
			render: item => <ZonesListCellAgencies agencyIds={item.agency_ids} />,
			title: t('default:zones.list.columns.agency_ids'),
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Zone) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[
			<ZonesListHeader key="header" />,
			<ZonesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={zoneId}
			/>
		</Pane>
	);

	//
}
