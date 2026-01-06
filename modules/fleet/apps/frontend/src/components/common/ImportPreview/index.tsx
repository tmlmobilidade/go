/* * */

import { useVehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { Translations } from '@/lib/translations';
import { Grid, Label, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

/**
 * Translate values based on field key
 */
function translateValue(field: string, value: unknown): string {
	if (value === undefined || value === null) return '-';

	const stringValue = String(value);

	switch (field) {
		// Boolean fields
		case 'bikes_allowed':
		case 'contactless':
		case 'passenger_counting':
			return Translations.BOOLEANS[stringValue === 'true' ? 'yes' : 'no'] ?? stringValue;

		// Emission class
		case 'emission_class':
			return Translations.EMISSION[stringValue as keyof typeof Translations.EMISSION] ?? stringValue;

		// Propulsion
		case 'propulsion':
			return Translations.PROPUNSIONAL[
				stringValue as keyof typeof Translations.PROPUNSIONAL
			] ?? stringValue;

		// Wheelchair accessibility
		case 'wheelchair_acessible':
			return Translations.WHEELCHAIR[
				stringValue as keyof typeof Translations.WHEELCHAIR
			] ?? stringValue;

		default:
			return stringValue;
	}
}

/* * */

/**
 * Display the changes detected for imported vehicles
 * Translates specific enum/boolean values for user-friendly display
 */
export function ImportPreview() {
	const { data } = useVehicleImportContext();

	if (!data.importPreview || data.importPreview.length === 0) {
		return null;
	}

	// Number of vehicles to be created (provided by backend counters)
	const createdCount = data.counters.created;

	// Show only UPDATE entries in the preview
	const updatesPreview = data.importPreview.filter(
		item => item.mode === 'UPDATE',
	);

	const maxChanges = data.counters.updated;

	return (
		<Section gap="lg">
			{/* Initial summary information */}
			<Label>
				{createdCount} vehicle(s) will be created
			</Label>

			{updatesPreview.map((item, index) => {
				const vehicleId = item.vehicle._id ?? 'Unknown ID';
				const licensePlate = item.vehicle.license_plate ?? 'Unknown Plate';

				const changesEntries = item.changes
					? Object.entries(item.changes).slice(0, maxChanges)
					: [];

				return (
					<Section key={index}>
						<Grid columns="abc" gap="lg">
							<ValueDisplay
								label="Mode"
								value="Update"
							/>

							<ValueDisplay
								label="Vehicle"
								value={`#ID ${vehicleId} (${licensePlate})`}
							/>

							{changesEntries.length > 0 ? (
								changesEntries.map(([key, value]) => (
									<ValueDisplay
										key={key}
										label={key}
										value={`Current: ${translateValue(
											key,
											value.oldValue,
										)} → New: ${translateValue(
											key,
											value.newValue,
										)}`}
									/>
								))
							) : (
								<ValueDisplay label="Changes" value="No changes" />
							)}

							{item.changes && Object.keys(item.changes).length > maxChanges && (
								<ValueDisplay
									label="Other changes"
									value={`+${Object.keys(item.changes).length - maxChanges} more`}
								/>
							)}
						</Grid>
					</Section>
				);
			})}
		</Section>
	);
}
