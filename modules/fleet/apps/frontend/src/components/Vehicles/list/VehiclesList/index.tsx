'use client';

/* * */

import { useVehiclesListContext } from '@/components/Vehicles/list/VehiclesList.context';
import { VehiclesListFiltersBar } from '@/components/Vehicles/list/VehiclesListFiltersBar';
import { VehiclesListHeader } from '@/components/Vehicles/list/VehiclesListHeader';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { VehicleNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

function formatDate(value: string): string {
	if (!/^\d{8}$/.test(value)) return value;

	const year = value.slice(0, 4);
	const month = value.slice(4, 6);
	const day = value.slice(6, 8);

	return `${day}-${month}-${year}`;
}

function FormatlLicense_plate(value: string): string {
	if (!value) return value;
	const f2 = value.slice(0, 2);
	const f4 = value.slice(2, 4);
	const f6 = value.slice(4, 6);

	return `${f2}-${f4}-${f6}`;
}

/* * */

export function VehiclesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const vehiclesListContext = useVehiclesListContext();
	const agenciesContext = useAgenciesContext();

	// Create an object that maps each agency ID to a display string
	// Format: { "agencyId": "agencyId - agencyName" }
	const agency = agenciesContext.data.raw.reduce((acc, agency) => {
	// Use the agency ID as the key
		acc[agency._id] = agency._id + ' - ' + agency.name;

		// Return the accumulator for the next iteration
		return acc;
	}, {} as Record<string, string>); // Initial value: empty object with string keys and values

	const columns: DataTableColumn<VehicleNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'agency_id',
			render: item => <Tag label={agency[item.agency_id]} />,
			title: 'Operador',
			width: 350,
		},
		{
			accessor: 'license_plate',
			render: item => <Tag label={FormatlLicense_plate(item.license_plate)} />,
			title: 'matrícula do veículo',
			width: 200,
		},
		{
			accessor: 'registration_date',
			render: item => <Tag label={formatDate(item.registration_date)} />,
			title: 'Data de registo do veíuclo',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: VehicleNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.fleet.VEHICLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (vehiclesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (vehiclesListContext.flags.error) {
		return <ErrorDisplay message={vehiclesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<VehiclesListHeader />,
			<VehiclesListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={vehiclesListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
