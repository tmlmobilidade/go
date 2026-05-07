'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { Button, Description, Grid, Label, NumberInput, Section } from '@tmlmobilidade/ui';

/* * */

export function LocationsCoordinateInput() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Handle actions

	const handleLatitudeChange = (value: string) => {
		const newCoordinates: [number, number] = [
			locationsContext.data.coordinates[0],
			Number(value),
		];
		locationsContext.actions.setCoordinates(newCoordinates);
	};

	const handleLongitudeChange = (value: string) => {
		const newCoordinates: [number, number] = [
			Number(value),
			locationsContext.data.coordinates[1],
		];
		locationsContext.actions.setCoordinates(newCoordinates);
	};

	//
	// C. Render components

	return (
		<Section gap="sm">
			<div>
				<Label>Coordenadas</Label>
				<Description>Insira as coordenadas do local que deseja visualizar</Description>
			</div>
			<Grid columns="ab" gap="sm">
				<NumberInput
					onChange={handleLatitudeChange}
					placeholder="Latitude"
					value={locationsContext.data.coordinates[1]}
				/>
				<NumberInput
					onChange={handleLongitudeChange}
					placeholder="Longitude"
					value={locationsContext.data.coordinates[0]}
				/>
			</Grid>
			<Button
				disabled={locationsContext.flags.isLoading}
				label={locationsContext.flags.isLoading ? 'A procurar...' : 'Procurar'}
				loading={locationsContext.flags.isLoading}
				onClick={locationsContext.actions.handleSearch}
				fullWidth
			/>
			{locationsContext.flags.error && (
				<Description>
					Erro: {locationsContext.flags.error}
				</Description>
			)}
		</Section>
	);

	//
}
