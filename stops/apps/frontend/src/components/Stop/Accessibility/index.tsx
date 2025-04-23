'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { BenchStatus, DockingBayType, ElectricityStatus, FlagStatus, LightningStatus, PavementType, PoleStatus, RoadType, SidewalkType } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

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

interface AccessibilityProps {
	bench_status: object
	docking_bay_type: object
	electricity_status: object
	flag_status: object
	lighting_status: object
	pavement_type: object
	pole_status: object
	road_type: object
	sidewalk_type: object
	// bench_status: BenchStatus
	// docking_bay_type: DockingBayType
	// electricity_status: ElectricityStatus
	// flag_status: FlagStatus
	// lighting_status: LightningStatus
	// pavement_type: PavementType
	// pole_status: PoleStatus
	// road_type: RoadType
	// sidewalk_type: SidewalkType
}

export default function Accessibility({ bench_status, docking_bay_type, electricity_status, flag_status, lighting_status, pavement_type, pole_status, road_type, sidewalk_type }: AccessibilityProps) {
	//
	// A. Transform data

	// const causeItems = causeSchema.options.map(cause => ({
	// 	icon: CauseIcons[cause],
	// 	label: Translations.CAUSE[cause],
	// 	value: cause,
	// }));

	//

	//
	// B. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações sobre a acessibilidade da paragem e sua envolvente."
				title="Acessibilidade"
			/>

			<Row>
				<Item
					comboBoxValues={sidewalkTypeValues}
					inputProps={sidewalk_type}
					isComboBox={true}
					label="Tem Passeio?"
				/>
				<Item
					comboBoxValues={benchStatusValues}
					inputProps={bench_status}
					isComboBox={true}
					label="Estado do Banco"
				/>
			</Row>

			<Row>
				<Item
					comboBoxValues={dockingBayTypeValues}
					inputProps={docking_bay_type}
					isComboBox={true}
					label="Tipo de Doca"
				/>
				<Item
					comboBoxValues={electricityStatusValues}
					inputProps={electricity_status}
					isComboBox={true}
					label="Estado da Electricidade"
				/>
			</Row>

			<Row>
				<Item
					comboBoxValues={flagStatusValues}
					inputProps={flag_status}
					isComboBox={true}
					label="Estado da Bandeira"
				/>
				<Item
					comboBoxValues={lightningStatusValues}
					inputProps={lighting_status}
					isComboBox={true}
					label="Estado da Luz"
				/>
			</Row>

			<Row>
				<Item
					comboBoxValues={pavementTypeValues}
					inputProps={pavement_type}
					isComboBox={true}
					label="Tipo de Pavimento"
				/>
				<Item
					comboBoxValues={poleStatusValues}
					inputProps={pole_status}
					isComboBox={true}
					label="Estado do Poste"
				/>
				<Item
					comboBoxValues={roadTypeValues}
					inputProps={road_type}
					isComboBox={true}
					label="Tipo de Estrada"
				/>
			</Row>

			{/* {<Row>
				<Item label="Tem Passeio?" value="Desconhecido" />
				<Item label="Tipo de Passeio" placeholder="Calçada Portuguesa, Betão" value="Sim" />
			</Row>

			<Row>
				<Item label="Tem Passadeira?" value="Desconhecido" />
				<Item label="Tem Acesso Rebaixado/Contínuo?" value="Desconhecido" />
				<Item label="Tem Acesso Largo?" value="Desconhecido" />
				<Item label="Tem Pavimento Tátil?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Tem Estacionamento Abusivo?" value="Desconhecido" />
				<Item label="Permite Embarque de PMR?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Última Manutenção da Acessibilidade" placeholder="2023-02-10" value="Sim" />
				<Item label="Última Verificação da Acessibilidade" placeholder="2023-02-10" value="Sim" />
			</Row>} */}
		</div>
	);
}
