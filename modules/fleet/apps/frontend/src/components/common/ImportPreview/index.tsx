import { useVehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { Translations } from '@/lib/translations';
import { type Agency } from '@tmlmobilidade/types';
import { Grid, Label, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

/**
 * Format date from YYYYMMDD to DD-MM-YYYY
 */
function formatDate(value: string): string {
	if (!/^\d{8}$/.test(value)) return value;

	const year = value.slice(0, 4);
	const month = value.slice(4, 6);
	const day = value.slice(6, 8);

	return `${day}-${month}-${year}`;
}

/* * */

/**
 * Resolve agency label from ID using agencies context
 * Returns: "id - name"
 */
function getAgencyLabel(
	agencyId: string | undefined,
	agencies: Agency[] | undefined,
): string {
	if (!agencyId || !agencies || agencies.length === 0) return '-';

	const agency = agencies.find(a => a._id === agencyId);

	if (!agency) return agencyId;

	return `${agency._id} - ${agency.name}`;
}

/* * */

/**
 * Translate values based on field key
 */
function translateValue(
	field: string,
	value: unknown,
	agencies?: Agency[],
): string {
	if (value === undefined || value === null) return '-';

	const stringValue = String(value);

	switch (field) {
		// Agency
		case 'agency_id':
			return getAgencyLabel(stringValue, agencies);

		// Boolean fields
		case 'bikes_allowed':
		case 'contactless':
		case 'passenger_counting':
			return (
				Translations.BOOLEANS[
					stringValue === 'true' ? 'yes' : 'no'
				] ?? stringValue
			);

		// Emission class
		case 'emission_class':
			return (
				Translations.EMISSION[
					stringValue as keyof typeof Translations.EMISSION
				] ?? stringValue
			);

		// Propulsion
		case 'propulsion':
			return (
				Translations.PROPUNSIONAL[
					stringValue as keyof typeof Translations.PROPUNSIONAL
				] ?? stringValue
			);

		// Date fields
		case 'registration_date':
			return formatDate(stringValue);

		// Wheelchair accessibility
		case 'wheelchair_acessible':
			return (
				Translations.WHEELCHAIR[
					stringValue as keyof typeof Translations.WHEELCHAIR
				] ?? stringValue
			);

		default:
			return stringValue;
	}
}

/* * */

/**
 * Display the changes detected for imported vehicles
 * Always shows ALL changed fields (no limits, no "+X more")
 */
export function ImportPreview() {
	const { data } = useVehicleImportContext();
	const agencyListContext = useAgenciesContext();

	if (!data.importPreview || data.importPreview.length === 0) {
		return null;
	}

	const agencies = agencyListContext.data.raw as Agency[];

	// Number of vehicles to be created (provided by backend counters)
	const createdCount = data.counters.created;
	const updatedCount = data.counters.updated;

	// Show only UPDATE entries in the preview
	const updatesPreview = data.importPreview.filter(
		item => item.mode === 'UPDATE',
	);

	return (
		<Section gap="sm">
			{/* Initial summary information */}

			<Label>Será criado {createdCount} veículo(s)</Label>
			<Label>Será atualizado {updatedCount} veículo(s)</Label>

			{updatesPreview.map((item, index) => {
				const vehicleId = item.vehicle._id ?? 'Unknown ID';
				const licensePlate = item.vehicle.license_plate ?? 'Unknown Plate';

				const changesEntries = item.changes
					? Object.entries(item.changes)
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
								value={`#ID ${vehicleId} (${licensePlate})`}
							/>

							{changesEntries.length > 0 ? (
								changesEntries.map(([key, value]) => (
									<ValueDisplay
										key={key}
										label={key}
										value={`Atual: ${translateValue(
											key,
											value.oldValue,
											agencies,
										)} → Novo: ${translateValue(
											key,
											value.newValue,
											agencies,
										)}`}
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
		</Section>
	);
}
