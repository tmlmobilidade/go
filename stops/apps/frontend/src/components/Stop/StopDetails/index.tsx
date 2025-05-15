'use client';

import type { OperationalStatus, operationalStatusSchema } from '@tmlmobilidade/types';

import { useManualContext } from '@/contexts/Manual.context';
import { audioTtsUrl } from '@/settings/url.settings';
import { StopOptions } from '@/utils/options.utils';
import { IconAlertHexagon, IconAlertHexagonOff, IconPlayerPause, IconVolume } from '@tabler/icons-react';
import { Collapsible, Grid, Section, TextArea, TextInput, Tooltip } from '@tmlmobilidade/ui';
import { useEffect, useRef, useState } from 'react';

/* * */

enum OperationalStatusValues {
	active = 'Paragem Activa',
	closed = 'Paragem Fechada',
	provisional = 'Paragem Provisória',
	seasonal = 'Paragem Sazonal',
	voided = 'Vazio',
}

export default function StopDetails({ data }) {
	//

	//
	// A. Setup variables

	const { isManual, setIsManual } = useManualContext();

	const [isPlaying, setIsPlaying] = useState(false);
	const audioPlayer = useRef<HTMLAudioElement | null>(null);

	//
	// B. Transform data

	useEffect(() => {
		audioPlayer.current = new Audio(`${audioTtsUrl}/stops/${data._id}.mp3`);
	}, []);

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
	}, []);

	//
	// C. Handle actions

	const handleShortName = () => {
	// Return if stop has no name
		if (!data.form.values.new_name || !data.form.values.short_name) return;
		// Copy the name first
		let shortenedStopName = data.form.values.new_name;
		// Shorten the stop name
		StopOptions.name_abbreviations
			.filter(abbreviation => abbreviation.enabled)
			.forEach((abbreviation) => {
				const regexExpression = new RegExp(abbreviation.phrase, 'g');
				shortenedStopName = shortenedStopName.replace(regexExpression, abbreviation.replacement);
			});
		// Save the new name
		data.form.setFieldValue('short_name', shortenedStopName);
	};

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

	// console.log('_id', stopDetailContext.data.form.getInputProps('_id'));
	// console.log('latitude', stopDetailContext.data.form.getInputProps('latitude'));

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
						{...data.form.getInputProps('_id')}
					/>

					<TextInput
						label="Latitude"
						maxLength={255}
						{...data.form.getInputProps('latitude')}
						onBlur={(e) => {
							const value = parseFloat(e.target.value);
							if (!isNaN(value)) {
								data.form.setFieldValue('latitude', value);
							}
							else {
								console.log('Invalid latitude value');
							}
						}}
					/>

					<TextInput
						label="Longitude"
						maxLength={255}
						{...data.form.getInputProps('longitude')}
						onBlur={(e) => {
							const value = parseFloat(e.target.value);
							if (!isNaN(value)) {
								data.form.setFieldValue('longitude', value);
							}
							else {
								console.log('Invalid longitude value');
							}
						}}
					/>
				</Grid>

				<Grid gap="md">
					<TextInput
						label="Antigo Nome da Paragem (p/ alterar)"
						maxLength={255}
						placeholder="Rua Marquês de Pombal 8"
						disabled
						{...data.form.getInputProps('name')}
					/>
				</Grid>

				<Grid gap="md">
					<TextInput
						label="Nome da Paragem (depois da correção)"
						maxLength={255}
						placeholder="Rua Marquês de Pombal 8"
						{...data.form.getInputProps('new_name')}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<Grid columns="ab" gap="md">
						<TextInput
							label="Nome Curto (Postalete)"
							maxLength={255}
							placeholder="R. Mrq. de Pombal 8"
							{...data.form.getInputProps('short_name')}
						/>

						<Tooltip label="Gerar Nome Curto" position="bottom">
							<IconAlertHexagon
								onClick={() => handleShortName()}
							/>
						</Tooltip>
						{/*
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
							)} */}
					</Grid>

					<Grid columns="ab" gap="md">
						<TextInput
							label="Nome Falado (Text-to-Speech)"
							maxLength={255}
							placeholder="Rua Marquês de Pombal Porta Oito"
							{...data.form.getInputProps('tts_name')}
							disabled
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
				<Item label="Estado Operacional" {...data.form.getInputProps('operational_status')} />
			</Grid> */}
			</Section>
		</Collapsible>

	);
}
