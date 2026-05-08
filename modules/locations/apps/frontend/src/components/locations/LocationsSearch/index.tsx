'use client';

import { useLocationsContext } from '@/contexts/Locations.context';
import { Combobox, Description, Grid, Label, Section } from '@tmlmobilidade/ui';

/* * */

interface LocationSearchItem {
	id: string
	label: string
	placeholder: string
}

// const LOCATION_TYPES = {
// 	district: 'Distrito',
// 	locality: 'Localidade',
// 	municipality: 'Município',
// 	parish: 'Freguesia',
// } as const;

const SEARCH_ITEMS: LocationSearchItem[] = [
	{ id: 'district', label: 'Distrito', placeholder: 'Selecione um distrito' },
	{ id: 'municipality', label: 'Município', placeholder: 'Selecione um município' },
	{ id: 'parish', label: 'Freguesia', placeholder: 'Selecione uma freguesia' },
	{ id: 'locality', label: 'Localidade', placeholder: 'Selecione uma localidade' },
];

/* * */

export function LocationsSearch() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const getComboboxData = (locationType: string) => {
		const locationData = locationsContext.data.location?.[locationType];
		if (!locationData?.geojson?.properties?.name) {
			return [];
		}

		return [{
			label: locationData.geojson.properties.name,
			value: locationData.geojson.properties.name,
		}];
	};

	//
	// C. Handle actions

	const handleLocationChange = (locationType: string, value: null | string) => {
		locationsContext.actions.setSelectedLocation(locationType, value);
	};

	//
	// D. Render components

	return (
		<Section gap="md">
			<div>
				<Label>Pesquisa por Localização</Label>
				<Description>Selecione as localizações específicas após pesquisar por coordenadas</Description>
			</div>
			<Grid columns="ab" gap="sm">
				{SEARCH_ITEMS.map((item) => {
					const comboboxData = getComboboxData(item.id);
					const isDisabled = comboboxData.length === 0;

					return (
						<Combobox
							key={item.id}
							data={comboboxData}
							disabled={isDisabled}
							label={item.label}
							onChange={(value: null | string) => handleLocationChange(item.id, value)}
							placeholder={isDisabled ? 'Nenhum dado disponível' : item.placeholder}
							value={locationsContext.data.selectedLocations[item.id]}
							clearable
						/>
					);
				})}
			</Grid>
			{!locationsContext.data.location && (
				<Description>
					Pesquise por coordenadas primeiro para popular as opções de localização
				</Description>
			)}
		</Section>
	);

	//
}
