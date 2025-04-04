'use client';

/* * */

import type { StopOperationalStatus } from '@carrismetropolitana/api-types/network';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';
import { useManualContext } from '@/contexts/Manual.context';
import { IconAlertHexagon, IconAlertHexagonOff, IconVolume } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

/* * */

import styles from '../styles.module.css';

/* * */

interface DetailsProps {
	id: string
	lat: number
	lon: number
	long_name: string
	old_long_name: string
	operational_status: 'voided' | StopOperationalStatus
	short_name: string
	tts_name: string
}

/* * */

export default function Details({ id, lat, lon, long_name, old_long_name, operational_status, short_name, tts_name }: DetailsProps) {
	//

	//
	// A. Setup variables

	const { isManual, setIsManual } = useManualContext();

	//
	// B. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações gerais sobre esta paragem"
				title="Detalhes desta Paragem"
			/>

			<Row>
				<Item label="Código Único da Paragem" placeholder="012345" value={id} />
				<Item label="Latitude" value={lat.toString()} />
				<Item label="Longitude" value={lon.toString()} />
			</Row>

			<Row>
				<Item
					color="green"
					label="Antigo Nome da Paragem (p/ alterar)"
					placeholder="Rua Marquês de Pombal 8"
					value={old_long_name}
				/>
			</Row>

			<Row>
				<Item label="Nome da Paragem (depois da correção)" placeholder="Rua Marquês de Pombal 8" value={long_name} />
			</Row>

			<Row hasIcons={true}>
				<Item
					color={isManual ? 'purple' : 'green'}
					label="Nome Curto (Postalete)"
					placeholder="R. Mrq. de Pombal 8"
					value={short_name}
				>
					{isManual
						? (
							<Tooltip label="Modo Manual Ativado" position="bottom">
								<IconAlertHexagon
									onClick={() => setIsManual(isManual => !isManual)}
								/>
							</Tooltip>
						)
						: (
							<Tooltip label="Modo Automático Ativado" position="bottom">
								<IconAlertHexagonOff
									onClick={() => setIsManual(isManual => !isManual)}
								/>
							</Tooltip>
						)}
				</Item>

				<Item label="Nome Falado (Text-to-Speech)" placeholder="Rua Marquês de Pombal Porta Oito" value={tts_name}>
					<IconVolume />
				</Item>
			</Row>

			<Row>
				<Item label="Estado Operacional" value={operational_status || 'active'} />
			</Row>
		</div>
	);
}
