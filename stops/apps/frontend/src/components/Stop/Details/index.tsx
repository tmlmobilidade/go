"use client";

import type { StopOperationalStatus } from '@carrismetropolitana/api-types/network';

import { useManualContext } from "@/contexts/Manual.context";

import { Tooltip } from "@tmlmobilidade/ui";
import { IconAlertHexagon, IconAlertHexagonOff, IconVolume } from "@tabler/icons-react";

import Header from "@/components/common/Header";
import Row from "@/components/common/Row";
import Item from "@/components/common/Row/Item";

import styles from '../styles.module.css';

interface DetailsProps {
	id: string;
	lat: number;
	lon: number;
	old_long_name: string;
	long_name: string;
	short_name: string;
	tts_name: string;
	operational_status: StopOperationalStatus | "voided";
}
export default function Details({ id, lat, lon, old_long_name, long_name, short_name, tts_name, operational_status }: DetailsProps) {
	const { isManual, setIsManual } = useManualContext();

	return <div className={styles.section}>
		<Header
			title={"Detalhes desta Paragem"}
			description={"Informações gerais sobre esta paragem"}
		/>

		<Row>
			<Item label={"Código Único da Paragem"} type={"text"} value={id} />
			<Item label={"Latitude"} type={"text"} value={lat.toString()} />
			<Item label={"Longitude"} type={"text"} value={lon.toString()} />
		</Row>

		<Row>
			<Item color={"green"} label={"Antigo Nome da Paragem (p/ alterar)"} type={"text"} value={old_long_name} />
		</Row>

		<Row>
			<Item label={"Nome da Paragem (depois da correção)"} type={"text"} value={long_name} />
		</Row>

		<Row hasIcons={true}>
			<Item color={isManual ? "purple" : "green"} label={"Nome Curto (Postalete)"} type={"text"} value={short_name}>
				{isManual ?
					<Tooltip label={"Modo Manual Ativado"} position={"bottom"}>
						<IconAlertHexagon
							onClick={() => setIsManual((isManual) => !isManual)}
						/>
					</Tooltip>
					:
					<Tooltip label={"Modo Automático Ativado"} position={"bottom"}>
						<IconAlertHexagonOff
							onClick={() => setIsManual((isManual) => !isManual)}
						/>
					</Tooltip>

				}
			</Item>

			<Item label={"Nome Falado (Text-to-Speech)"} type={"text"} value={tts_name}>
				<IconVolume />
			</Item>
		</Row>

		<Row>
			<Item label={"Estado Operacional"} type={"text"} value={operational_status} />
		</Row>
	</div >;
}
