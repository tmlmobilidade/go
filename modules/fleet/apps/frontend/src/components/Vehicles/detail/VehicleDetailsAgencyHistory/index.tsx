'use client';

import { VehicleDetailsAgencyHistoryItem } from '@/components/Vehicles/detail/VehicleDetailsAgencyHistoryItem';
import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { Button, Collapsible, Grid, Label, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function VehicleDetailsAgencyHistory() {
	//

	//
	// A. Setup variables

	const vehiclesDetailContext = useVehiclesDetailContext();
	const agencyHistory = vehiclesDetailContext.data.form.values.agency_history ?? [];
	const licensePlate = vehiclesDetailContext.data.form.values.license_plate ?? vehiclesDetailContext.data.vehicle?._id ?? 'N/A';
	const operatorIds = Array
		.from(new Set([
			vehiclesDetailContext.data.form.values.vehicle_id,
			...agencyHistory.map(item => item.vehicle_id),
		]))
		.filter(Boolean)
		.sort();

	//
	// B. Handle actions

	const handleAddAgencyHistoryItem = () => {
		vehiclesDetailContext.data.form.insertListItem('agency_history', {
			agency_id: vehiclesDetailContext.data.form.values.agency_id ?? '',
			start_date: vehiclesDetailContext.data.form.values.start_date,
			vehicle_id: vehiclesDetailContext.data.form.values.vehicle_id ?? '',
		});
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Agências às quais este veículo esteve associado."
			title="Histórico de Agências"
		>
			<Section gap="md">
				<Grid columns="abb" gap="md">
					<ValueDisplay
						label="Matrícula"
						value={licensePlate}
						variant="primary"
						elevated
						strong
					/>
					<ValueDisplay
						label="IDs dos operadores"
						value={operatorIds.length > 0 ? operatorIds.join(', ') : 'N/A'}
					/>
				</Grid>

				<Label>Operadores</Label>

				{agencyHistory.map((item, index) => (
					<VehicleDetailsAgencyHistoryItem key={`${item.agency_id}-${item.vehicle_id}-${index}`} index={index} />
				))}

				{!vehiclesDetailContext.flags.read_only && (
					<Button label="Adicionar operador" onClick={handleAddAgencyHistoryItem} />
				)}
			</Section>
		</Collapsible>
	);
}
