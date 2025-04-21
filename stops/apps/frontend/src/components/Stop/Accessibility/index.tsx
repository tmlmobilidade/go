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

enum BenchStatusValues {
	is_damaged = 'Estragado',
	is_missing = 'Em Falta',
	is_ok = 'Em Bom Estado',
	not_applicable = 'Não Aplicável',
	unknown = 'Desconhecido',
}

enum DockingBayTypeValues {
	cut_in_road_with_marks = 'Cortado na Estrado com Marcas',
	cut_in_road_without_marks = 'Cortado na Estrada sem Marcas',
	island = 'Ilha',
	peninsula = 'Península',
	simple_interaction = 'Interação Simples',
	unknown = 'Desconhecido',
}

enum ElectricityStatusValues {
	available = 'Disponível',
	unavailable = 'Indisponível',
	unknown = 'Desconhecido',
}

enum FlagStatusValues {
	is_damaged = 'Estragado',
	is_missing = 'Em Falta',
	is_ok = 'Em Bom Estado',
	not_applicable = 'Não Aplicável',
	unknown = 'Desconhecido',
}

enum LightningStatusValues {
	confortable = 'Confortável',
	damaged = 'Estragado',
	insuficient = 'Insuficiente',
	moderate = 'Moderado',
	unavailable = 'Indisponível',
	unknown = 'Desconhecido',
}

enum PavementTypeValues {
	asphalt = 'Asfalto',
	concrete = 'Concreto',
	dirt = 'Terra',
	grass = 'Relva',
	gravel = 'Gravilha',
	portuguese_stones = 'Calçada Portuguesa',
	unknown = 'Desconhecido',
}

enum PoleStatusValues {
	is_damaged = 'Estragado',
	is_missing = 'Em Falta',
	is_ok = 'Em Bom Estado',
	not_applicable = 'Não Aplicável',
	unknown = 'Desconhecido',
}

enum RoadTypeValues {
	complementary_itinerary = 'Itenerário Complementar',
	highway = 'Auto-estrada',
	main_itinerary = 'Itinerário Principal',
	national_road = 'Estrada Nacional',
	regional_road = 'Estrada Regional',
	secondary_road = 'Estrada Secundária',
	unknown = 'Desconhecido',
}

interface AccessibilityProps {
	bench_status: BenchStatus
	docking_bay_type: DockingBayType
	electricity_status: ElectricityStatus
	flag_status: FlagStatus
	lighting_status: LightningStatus
	pavement_type: PavementType
	pole_status: PoleStatus
	road_type: RoadType
	sidewalk_type: SidewalkType
}

export default function Accessibility({ bench_status, docking_bay_type, electricity_status, flag_status, lighting_status, pavement_type, pole_status, road_type, sidewalk_type }: AccessibilityProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações sobre a acessibilidade da paragem e sua envolvente."
				title="Acessibilidade"
			/>

			<Row>
				<Item label="Tem Passeio?" value={SidewalkTypeValues[sidewalk_type]} />
				<Item label="Estado do Banco" value={BenchStatusValues[bench_status]} />
			</Row>

			<Row>
				<Item label="Tipo de Doca" value={DockingBayTypeValues[docking_bay_type]} />
				<Item label="Estado da Electricidade" value={ElectricityStatusValues[electricity_status]} />
			</Row>

			<Row>
				<Item label="Estado da Bandeira" value={FlagStatusValues[flag_status]} />
				<Item label="Estado da Luz" value={LightningStatusValues[lighting_status]} />
			</Row>

			<Row>
				<Item label="Tipo de Pavimento" value={PavementTypeValues[pavement_type]} />
				<Item label="Estado do Poste" value={PoleStatusValues[pole_status]} />
				<Item label="Tipo de Estrada" value={RoadTypeValues[road_type]} />
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
