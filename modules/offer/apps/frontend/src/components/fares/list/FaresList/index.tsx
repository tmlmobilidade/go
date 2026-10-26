'use client';

import { FaresListCellAgencies } from '@/components/fares/list/FaresListCellAgencies';
import { FaresListHeader } from '@/components/fares/list/FaresListHeader';
import { FaresListFiltersBar } from '@/components/fares/list/filters/FaresListFiltersBar';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useFaresDetailFareId } from '../../detail/use-fares-detail-fare-id';
import { useFaresListData } from '../use-fares-list-data';

/* * */

export function FaresList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data, error, isLoading } = useFaresListData();
	const { fareId } = useFaresDetailFareId();
	const { t } = useTranslation();

	const columns: DataTableColumn<Fare>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:fares.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'code',
			render: item => <Text>{item.code}</Text>,
			title: t('default:fares.list.columns.code'),
			width: 200,
		},
		{
			accessor: 'name',
			render: item => <Text>{item.name}</Text>,
			title: t('default:fares.list.columns.name'),
			width: 300,
		},
		{
			accessor: 'agency_ids',
			render: item => <FaresListCellAgencies agencyIds={item.agency_ids} />,
			title: t('default:fares.list.columns.agency_ids'),
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Fare) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_DETAIL(item._id)));
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
			<FaresListHeader key="header" />,
			<FaresListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={fareId}
			/>
		</Pane>
	);

	//
}
