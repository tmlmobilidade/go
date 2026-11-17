'use client';

import { useVehiclesDetailVehicleId } from '@/components/vehicles/detail/use-vehicles-detail-vehicle-id';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Label, OperationalDateDisplay, Pane } from '@tmlmobilidade/ui';
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
			render: item => <IdTag id={item._id} copyOnClick />,
			title: t('default:vehicles.list.VehiclesList.columns.id.label'),
			width: 150,
		},
		{
			accessor: 'registration_date',
			render: item => <OperationalDateDisplay value={Number(item.registration_date) as OperationalDateInt} />,
			title: t('default:vehicles.list.VehiclesList.columns.registration_date.label'),
			width: 200,
		},
		{
			accessor: 'vehicle_type',
			render: item => <Label>{t(`vehicle-enums:vehicle_type.${item.vehicle_type}`)}</Label>,
			title: t('default:vehicles.list.VehiclesList.columns.vehicle_type.label'),
			width: 200,
		},
		{
			accessor: 'emission',
			render: item => <Label>{t(`vehicle-enums:emission.${item.emission}`)}</Label>,
			title: t('default:vehicles.list.VehiclesList.columns.emission.label'),
			width: 200,
		},
		{
			accessor: 'propulsion',
			render: item => <Label>{t(`vehicle-enums:propulsion.${item.propulsion}`)}</Label>,
			title: t('default:vehicles.list.VehiclesList.columns.propulsion.label'),
			width: 250,
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
