'use client';

import Header from "@/components/common/Header";
import Row from "@/components/common/Row";
import Item from "@/components/common/Row/Item";
import { Button, Tooltip } from "@tmlmobilidade/ui";

import styles from '../styles.module.css';
import { IconAlertHexagon, IconAlertHexagonOff, IconVolume } from "@tabler/icons-react";
import React from "react";

// interface DetailsProps {
// 	_id?: string | undefined;
// 	latitude?: number | undefined;
// 	longitude?: number | undefined;
// 	name?: string | undefined;
// 	operational_status?: "active" | "inactive" | "provisional" | "seasonal" | "voided" | undefined;
// 	short_name?: string | null | undefined;
// 	tts_name?: string | null | undefined;
// }

// export default function Details({
// 	_id,
// 	latitude,
// 	longitude,
// 	name,
// 	operational_status,
// 	short_name,
// 	tts_name
// }: DetailsProps) {
export default function Details() {
	const [isManual, setIsManual] = React.useState(true);
	return <div className={styles.section}>
		<Header
			title={"Detalhes desta Paragem"}
			description={"Informações gerais sobre esta paragem"}
		/>

		<Row>
			<Item label={"Código Único da Paragem"} type={"text"} value={"Sim"} />
			<Item label={"Latitude"} type={"text"} value={"Sim"} />
			<Item label={"Longitude"} type={"text"} value={"Sim"} />
		</Row>

		<Row>
			<Item color={"green"} label={"Antigo Nome da Paragem (p/ alterar)"} type={"text"} value={"Rua Carlos Manuel Rodrigues Francisco (Escola)"} />
		</Row>

		<Row>
			<Item label={"Nome da Paragem (depois da correção)"} type={"text"} value={"Sim"} />
		</Row>

		<Row hasIcons={true}>
			<Item color={isManual ? "green" : "purple"} label={"Nome Curto (Postalete)"} type={"text"} value={"Sim"}>
				{isManual ?
					<Tooltip label={"Modo Automático Ativado"} position={"bottom"}>
						<IconAlertHexagonOff
							onClick={() => setIsManual((isManual) => !isManual)}
						/>
					</Tooltip>
					:
					<Tooltip label={"Modo Manual Ativado"} position={"bottom"}>
						<IconAlertHexagon
							onClick={() => setIsManual((isManual) => !isManual)}
						/>
					</Tooltip>
				}
			</Item>

			<Item label={"Nome Falado (Text-to-Speech)"} type={"text"} value={"Sim"}>
				<IconVolume />
			</Item>
		</Row>

		<Row>
			<Item label={"Estado Operacional"} type={"text"} value={"Sim"} />
		</Row>
	</div >;
}
