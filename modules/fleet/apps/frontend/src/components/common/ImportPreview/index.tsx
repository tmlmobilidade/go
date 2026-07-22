import { useVehicleImportContext } from '@/contexts/VehicleImport.context';
import { translateFormValue } from '@/utils/translateFormValue';
import { Divider, Grid, Label, Section, useAgenciesContext, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function ImportPreview() {
	const { data } = useVehicleImportContext();
	const agenciesContext = useAgenciesContext();

	if (!data.importPreview || data.importPreview.length === 0) {
		return null;
	}

	// Number of vehicles to be created (provided by backend counters)
	const createdCount = data.counters.created;
	const updatedCount = data.counters.updated;
	const agenciesData = agenciesContext.data.raw;

	// Show only UPDATE entries in the preview
	const updatesPreview = data.importPreview.filter(
		item => item.mode === 'UPDATE',
	);

	return (
		<Section gap="md">
			{/* Initial summary information */}

			<Label>Será criado {createdCount} veículo(s)</Label>
			<Label>Será atualizado {updatedCount} veículo(s)</Label>

			{updatesPreview.map((item, index) => {
				const licensePlate = item.vehicle.license_plate ?? 'Unknown Plate';
				const operatorVehicleId = item.vehicle.vehicle_id ?? 'Unknown ID';

				const changesEntries = item.changes
					? Object.entries(item.changes).filter(
						([key]) => key !== 'is_locked',
					)
					: [];

				return (
					<Section key={index}>
						<Grid columns="abc" gap="lg">
							<ValueDisplay
								label="Modo"
								value="Atualizar"
							/>

							<ValueDisplay
								label="Veículo"
								value={`${licensePlate} · ID do operador ${operatorVehicleId}`}
							/>

							{changesEntries.length > 0 ? (changesEntries.map(([key, value]) => (
								<ValueDisplay
									key={key}
									label={key}
									value={(
										<>
											<span style={{ color: 'red' }}>
												Atual: {translateFormValue(key, value.oldValue, agenciesData)}
											</span>
											{' '} → {' '}
											<span style={{ color: 'green' }}>
												Novo: {translateFormValue(key, value.newValue, agenciesData)}
											</span>
										</>
									)}
								/>

							))
							) : (
								<ValueDisplay
									label="Alterações"
									value="Sem alterações"
								/>
							)}
						</Grid>
					</Section>

				);
			})}
			<Divider />
		</Section>

	);
}
