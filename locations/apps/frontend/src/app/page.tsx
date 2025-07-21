'use client';

/* * */

import type { Location } from '@tmlmobilidade/types';

import { MapView } from '@/components/map';
import { useMapOptionsContext } from '@/components/map/MapOptions.context';
import MapViewGeoJson from '@/components/map/MapViewGeoJson';
import { Badge, Button, Description, Grid, Label, NumberInput, Pane, Section } from '@tmlmobilidade/ui';
import { MapProvider } from '@vis.gl/react-maplibre';
import { useState } from 'react';

/* * */

export default function Page() {
	//

	//
	const [location, setLocation] = useState<Location | null>(null);
	const [lonAndLat, setLonAndLat] = useState<[number, number]>([-8.7486622, 38.6625867]);
	const [filterOut, setFilterOut] = useState<string[]>([]);

	const mapOptionsContext = useMapOptionsContext();

	//
	const handleSearch = async () => {
		const response = await fetch(`/api/coordinates?lon=${lonAndLat[0]}&lat=${lonAndLat[1]}`);
		const data = await response.json();
		setLocation(data);
		mapOptionsContext.actions.centerMap('district');
	};

	const handleFilter = (filter: string) => {
		setFilterOut(filterOut.includes(filter) ? filterOut.filter(f => f !== filter) : [...filterOut, filter]);
	};

	//
	return (
		<MapProvider>
			<Section>
				<Grid columns="aab" gap="md">
					<Pane>
						<Section>
							<div style={{ height: 700, width: '100%' }}>
								<MapView debug>
									{/* Districts */}
									{location?.district && !filterOut.includes('district') && (
										<MapViewGeoJson color="green" data={location.district.geojson} id="district" />
									)}
									{/* Municipalities */}
									{location?.municipality && !filterOut.includes('municipality') && (
										<MapViewGeoJson color="blue" data={location.municipality.geojson} id="municipality" />
									)}
									{/* Parish */}
									{location?.parish && !filterOut.includes('parish') && (
										<MapViewGeoJson color="red" data={location.parish.geojson} id="parish" />
									)}
									{/* Localities */}
									{location?.locality && !filterOut.includes('locality') && (
										<MapViewGeoJson color="yellow" data={location.locality.geojson} id="locality" />
									)}
								</MapView>
							</div>
						</Section>
					</Pane>
					<Pane>
						<Section gap="sm">
							<div>
								<Label>Coordenadas</Label>
								<Description>Insira as coordenadas do local que deseja visualizar</Description>
							</div>
							<Grid columns="ab" gap="sm">
								<NumberInput onChange={e => setLonAndLat([lonAndLat[0], Number(e)])} placeholder="Latitude" value={lonAndLat[1]} />
								<NumberInput onChange={e => setLonAndLat([Number(e), lonAndLat[1]])} placeholder="Longitude" value={lonAndLat[0]} />
							</Grid>
							<Button
								label="Procurar"
								onClick={handleSearch}
								fullWidth
							/>
						</Section>
						<Section gap="md">
							<div>
								<Label>Filtros</Label>
								<Description>Selecione os filtros que deseja aplicar</Description>
							</div>
							<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" justifyContent="space-between" padding="none">
								<Badge onClick={() => handleFilter('locality')} size="sm" variant={!filterOut.includes('locality') ? 'primary' : 'muted'}>Localidade</Badge>
								<Badge onClick={() => handleFilter('municipality')} size="sm" variant={!filterOut.includes('municipality') ? 'primary' : 'muted'}>Município</Badge>
								<Badge onClick={() => handleFilter('parish')} size="sm" variant={!filterOut.includes('parish') ? 'primary' : 'muted'}>Freguesia</Badge>
								<Badge onClick={() => handleFilter('district')} size="sm" variant={!filterOut.includes('district') ? 'primary' : 'muted'}>Distrito</Badge>
							</Section>
						</Section>
					</Pane>
				</Grid>
			</Section>
		</MapProvider>
	);
}
