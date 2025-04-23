'use client';

import type { OperationalStatus, operationalStatusSchema } from '@tmlmobilidade/types';

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';
import { useManualContext } from '@/contexts/Manual.context';
import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { audioTtsUrl } from '@/settings/url.settings';
import { IconAlertHexagon, IconAlertHexagonOff, IconPlayerPause, IconVolume } from '@tabler/icons-react';
import { Collapsible, Grid, Section, TextArea, TextInput, Tooltip } from '@tmlmobilidade/ui';
// import { Tooltip } from '@tmlmobilidade/ui';
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

// interface DetailsProps {
// 	_id: object
// 	latitude: object
// 	longitude: object
// 	// _id: string
// 	name: object
// 	new_name: object
// 	operational_status: OperationalStatus
// 	short_name: object
// 	tts_name: object
// }

/* * */

// export default function Details({ _id, latitude, longitude, name, new_name, operational_status, short_name, tts_name }: DetailsProps) {
export default function Details() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const { isManual, setIsManual } = useManualContext();

	const [isPlaying, setIsPlaying] = useState(false);
	const audioPlayer = useRef<HTMLAudioElement | null>(null);

	const _id = stopDetailContext.data.form.getInputProps('_id');
	const latitude = stopDetailContext.data.form.getInputProps('latitude');
	const longitude = stopDetailContext.data.form.getInputProps('longitude');
	const name = stopDetailContext.data.form.getInputProps('name');
	const new_name = stopDetailContext.data.form.getInputProps('new_name');
	const operational_status = stopDetailContext.data.form.getInputProps('operational_status');
	const short_name = stopDetailContext.data.form.getInputProps('short_name');
	const tts_name = stopDetailContext.data.form.getInputProps('tts_name');

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
		<Collapsible
			description="Informações gerais sobre esta paragem"
			title="Detalhes desta Paragem"
		>
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<TextInput
						label="Código Único da Paragem"
						maxLength={255}
						placeholder="012345"
						{..._id}
					/>

					<TextInput
						label="Latitude"
						maxLength={255}
						{...latitude}
					/>

					<Item
						{...longitude}
						label="Longitude"
						maxLength={255}
					/>
				</Grid>

				<Grid gap="md">
					<TextInput
						label="Antigo Nome da Paragem (p/ alterar)"
						maxLength={255}
						placeholder="Rua Marquês de Pombal 8"
						disabled
						{...name}
					/>
				</Grid>

				<Grid gap="md">
					<TextInput
						label="Nome da Paragem (depois da correção)"
						maxLength={255}
						placeholder="Rua Marquês de Pombal 8"
						{...new_name}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<Grid columns="ab" gap="md">
						<TextInput
							label="Nome Curto (Postalete)"
							maxLength={255}
							placeholder="R. Mrq. de Pombal 8"
							{...short_name}
						/>
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
					</Grid>

					<Grid columns="ab" gap="md">
						<TextInput
							label="Nome Falado (Text-to-Speech)"
							maxLength={255}
							placeholder="Rua Marquês de Pombal Porta Oito"
							{...short_name}
						/>

						<Tooltip label="Text to Speech" position="bottom">
							{audioPlayer && (
								isPlaying
									? <IconPlayerPause onClick={() => handleToogleAudio()} />
									: <IconVolume onClick={() => handleToogleAudio()} />
							)}
						</Tooltip>
					</Grid>
				</Grid>

				{/* <Grid gap="md">
				<Item label="Estado Operacional" value={OperationalStatusValues[operational_status] || 'Vazio'} />
			</Grid> */}
			</Section>
		</Collapsible>

	);
}
