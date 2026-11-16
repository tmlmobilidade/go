'use client';

import { useVehiclesDetailVehicleId } from '@/components/vehicles/detail/use-vehicles-detail-vehicle-id';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, OperationalDateDisplay, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { VehiclesListFiltersBar } from '../filters/VehiclesListFiltersBar';
import { useVehiclesListData } from '../use-vehicles-list-data';
import { VehiclesListHeader } from '../VehiclesListHeader';

/* * */

export function VehiclesList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { vehicleId } = useVehiclesDetailVehicleId();

	const vehiclesData = useVehiclesListData();

	const columns: DataTableColumn<VehiclesListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:vehicles.list.VehiclesList.columns.id.label'),
			width: 100,
		},
		{
			accessor: 'registration_date',
			render: item => <OperationalDateDisplay value={Number(item.registration_date) as OperationalDateInt} />,
			title: t('default:vehicles.list.VehiclesList.columns.registration_date.label'),
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: VehiclesListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.operation.VEHICLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[
			<VehiclesListHeader key="header" />,
			<VehiclesListFiltersBar key="filters" />,
		]}
		>
			{vehiclesData.error && <ErrorDisplay message={vehiclesData.error} />}
			<DataTable
				columns={columns}
				isLoading={vehiclesData.isLoading}
				onRowClick={handleRowClick}
				records={vehiclesData.data}
				rowIdAccessor="_id"
				selectedId={vehicleId}
			/>
		</Pane>
	);
}
