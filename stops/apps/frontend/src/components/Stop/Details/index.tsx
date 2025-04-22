'use client';

import type { OperationalStatus, operationalStatusSchema } from '@tmlmobilidade/types';

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';
import { useManualContext } from '@/contexts/Manual.context';
import { audioTtsUrl } from '@/settings/url.settings';
import { IconAlertHexagon, IconAlertHexagonOff, IconPlayerPause, IconVolume } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { useEffect, useRef, useState } from 'react';

import styles from '../styles.module.css';

/* * */

enum OperationalStatusValues {
	active = 'Paragem Activa',
	closed = 'Paragem Fechada',
	provisional = 'Paragem Provisória',
	seasonal = 'Paragem Sazonal',
	voided = 'Vazio',
}

interface DetailsProps {
	_id: object
	// inputProps: object
	latitude: object
	longitude: object
	// _id: string
	// // inputProps: object
	// latitude: number
	// longitude: number
	name: object
	// name: string
	new_name: object
	// new_name: string
	operational_status: OperationalStatus
	short_name: string
	tts_name: string
}

/* * */

export default function Details({ _id, latitude, longitude, name, new_name, operational_status, short_name, tts_name }: DetailsProps) {
	//

	//
	// A. Setup variables

	const { isManual, setIsManual } = useManualContext();

	const [isPlaying, setIsPlaying] = useState(false);
	const audioPlayer = useRef<HTMLAudioElement | null>(null);

	//
	// B. Transform data

	useEffect(() => {
		audioPlayer.current = new Audio(`${audioTtsUrl}/stops/${_id}.mp3`);
	}, [_id]);

	useEffect(() => {
		if (audioPlayer.current) {
			audioPlayer.current.onplaying = () => setIsPlaying(true);
			audioPlayer.current.onpause = () => setIsPlaying(false);
			audioPlayer.current.onabort = () => setIsPlaying(false);
		}
		return () => {
			if (audioPlayer.current) {
				audioPlayer.current.onplaying = null;
				audioPlayer.current.onpause = null;
				audioPlayer.current.onabort = null;
			}
		};
	}, [_id]);

	//
	// C. Handle actions

	const handleToogleAudio = () => {
		if (isPlaying) {
			audioPlayer.current?.pause();
		}
		else {
			audioPlayer.current?.load();
			audioPlayer.current?.play();
		}
		// analyticsContext.actions.capture(ampli => ampli.stopAudioPlayed({ audio_played: 'true', stop_id: stopId || '' }));
	};

	//
	// D. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações gerais sobre esta paragem"
				title="Detalhes desta Paragem"
			/>

			<Row>
				<Item
					inputProps={_id}
					label="Código Único da Paragem"
					placeholder="012345"
				/>
				<Item
					inputProps={latitude}
					label="Latitude"
				/>
				<Item
					inputProps={longitude}
					label="Longitude"
				/>
			</Row>

			<Row>
				<Item
					color="green"
					inputProps={name}
					label="Antigo Nome da Paragem (p/ alterar)"
					placeholder="Rua Marquês de Pombal 8"
				/>
			</Row>

			<Row>
				<Item
					inputProps={new_name}
					label="Nome da Paragem (depois da correção)"
					placeholder="Rua Marquês de Pombal 8"
				/>
			</Row>
			{/*
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
					{audioPlayer && (
						isPlaying
							? <IconPlayerPause onClick={() => handleToogleAudio()} />
							: <IconVolume onClick={() => handleToogleAudio()} />
					)}
				</Item>
			</Row>

			<Row>
				<Item label="Estado Operacional" value={OperationalStatusValues[operational_status] || 'Vazio'} />
			</Row> */}
		</div>
	);
}
