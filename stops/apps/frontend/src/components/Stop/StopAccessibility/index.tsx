'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Collapsible, Combobox, Grid, Section } from '@tmlmobilidade/ui';

export function StopAccessibility() {
	//

	//
	// A. Setup variables
	const stopsDetailContext = useStopsDetailContext();

	enum SidewalkTypeValues {
		gutter = 'Sarjeta',
		inaccessible = 'Inacessível',
		is_ok = 'Passeio Operacional',
		none = 'Sem Passeio',
		unknown = 'Desconhecido',
	}

	const sidewalkTypeValues = [
		'gutter',
		'inaccessible',
		'is_ok',
		'none',
		'unknown',
	];

	enum BenchStatusValues {
		is_damaged = 'Estragado',
		is_missing = 'Em Falta',
		is_ok = 'Em Bom Estado',
		not_applicable = 'Não Aplicável',
		unknown = 'Desconhecido',
	}

	const benchStatusValues = [
		'is_damaged',
		'is_missing',
		'is_ok',
		'not_applicable',
		'unknown',
	];

	enum DockingBayTypeValues {
		cut_in_road_with_marks = 'Cortado na Estrado com Marcas',
		cut_in_road_without_marks = 'Cortado na Estrada sem Marcas',
		island = 'Ilha',
		peninsula = 'Península',
		simple_interaction = 'Interação Simples',
		unknown = 'Desconhecido',
	}

	const dockingBayTypeValues = [
		'cut_in_road_with_marks',
		'cut_in_road_without_marks',
		'island',
		'peninsula',
		'simple_interaction',
		'unknown',
	];

	enum ElectricityStatusValues {
		available = 'Disponível',
		unavailable = 'Indisponível',
		unknown = 'Desconhecido',
	}

	const electricityStatusValues = [
		'available',
		'unavailable',
		'unknown',
	];

	enum FlagStatusValues {
		is_damaged = 'Estragado',
		is_missing = 'Em Falta',
		is_ok = 'Em Bom Estado',
		not_applicable = 'Não Aplicável',
		unknown = 'Desconhecido',
	}

	const flagStatusValues = [
		'is_damaged',
		'is_missing',
		'is_ok',
		'not_applicable',
		'unknown',
	];

	enum LightningStatusValues {
		confortable = 'Confortável',
		damaged = 'Estragado',
		insuficient = 'Insuficiente',
		moderate = 'Moderado',
		unavailable = 'Indisponível',
		unknown = 'Desconhecido',
	}

	const lightningStatusValues = [
		'confortable',
		'damaged',
		'insuficient',
		'moderate',
		'unavailable',
		'unknown',
	];

	enum PavementTypeValues {
		asphalt = 'Asfalto',
		concrete = 'Concreto',
		dirt = 'Terra',
		grass = 'Relva',
		gravel = 'Gravilha',
		portuguese_stones = 'Calçada Portuguesa',
		unknown = 'Desconhecido',
	}

	const pavementTypeValues = [
		'asphalt',
		'concrete',
		'dirt',
		'grass',
		'gravel',
		'portuguese_stones',
		'unknown',
	];

	enum PoleStatusValues {
		is_damaged = 'Estragado',
		is_missing = 'Em Falta',
		is_ok = 'Em Bom Estado',
		not_applicable = 'Não Aplicável',
		unknown = 'Desconhecido',
	}

	const poleStatusValues = [
		'is_damaged',
		'is_missing',
		'is_ok',
		'not_applicable',
		'unknown',
	];

	enum RoadTypeValues {
		complementary_itinerary = 'Itenerário Complementar',
		highway = 'Auto-estrada',
		main_itinerary = 'Itinerário Principal',
		national_road = 'Estrada Nacional',
		regional_road = 'Estrada Regional',
		secondary_road = 'Estrada Secundária',
		unknown = 'Desconhecido',
	}

	const roadTypeValues = [
		'complementary_itinerary',
		'highway',
		'main_itinerary',
		'national_road',
		'regional_road',
		'secondary_road',
		'unknown',
	];

	//
	// B. Transform data
	const sidewalkTypeItems = sidewalkTypeValues.map(el => ({
		label: SidewalkTypeValues[el],
		value: el,
	}));

	const benchStatusItems = benchStatusValues.map(el => ({
		label: BenchStatusValues[el],
		value: el,
	}));

	const dockingBayTypeItems = dockingBayTypeValues.map(el => ({
		label: DockingBayTypeValues[el],
		value: el,
	}));

	const electricityStatusItems = electricityStatusValues.map(el => ({
		label: ElectricityStatusValues[el],
		value: el,
	}));

	const flagStatusItems = flagStatusValues.map(el => ({
		label: FlagStatusValues[el],
		value: el,
	}));

	const lightningStatusItems = lightningStatusValues.map(el => ({
		label: LightningStatusValues[el],
		value: el,
	}));

	const pavementTypeItems = pavementTypeValues.map(el => ({
		label: PavementTypeValues[el],
		value: el,
	}));

	const poleStatusItems = poleStatusValues.map(el => ({
		label: PoleStatusValues[el],
		value: el,
	}));

	const roadTypeItems = roadTypeValues.map(el => ({
		label: RoadTypeValues[el],
		value: el,
	}));

	//
	// C. Render components
	return (

		<Collapsible
			description="Informações sobre a acessibilidade da paragem e sua envolvente."
			title="Acessibilidade"
		>
			<Section gap="md">
				<Grid columns="ab" gap="md">
					<Combobox
						data={sidewalkTypeItems}
						label="Tem Passeio?"
						{...stopsDetailContext.data.form.getInputProps('sidewalk_type')}
					/>

					<Combobox
						data={benchStatusItems}
						label="Estado do Banco"
						{...stopsDetailContext.data.form.getInputProps('bench_status')}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<Combobox
						data={dockingBayTypeItems}
						label="Tipo de Doca"
						{...stopsDetailContext.data.form.getInputProps('docking_bay_type')}
					/>

					<Combobox
						data={electricityStatusItems}
						label="Estado da Electricidade"
						{...stopsDetailContext.data.form.getInputProps('electricity_status')}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<Combobox
						data={flagStatusItems}
						label="Estado da Bandeira"
						{...stopsDetailContext.data.form.getInputProps('flag_status')}
					/>

					<Combobox
						data={lightningStatusItems}
						label="Estado da Luz"
						{...stopsDetailContext.data.form.getInputProps('lighting_status')}
					/>
				</Grid>

				<Grid columns="abc" gap="md">
					<Combobox
						data={pavementTypeItems}
						label="Tipo de Pavimento"
						{...stopsDetailContext.data.form.getInputProps('pavement_type')}
					/>

					<Combobox
						data={poleStatusItems}
						label="Estado do Poste"
						{...stopsDetailContext.data.form.getInputProps('pole_status')}
					/>

					<Combobox
						data={roadTypeItems}
						label="Tipo de Estrada"
						{...stopsDetailContext.data.form.getInputProps('road_type')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
