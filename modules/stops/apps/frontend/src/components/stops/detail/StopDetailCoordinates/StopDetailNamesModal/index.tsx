'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetailCoordinates.modal';
import { audioTtsUrl } from '@/settings/urls.settings';
import { Button, Grid, Label, Pane, Section, Spacer, TextInput, Toolbar } from '@tmlmobilidade/ui';

import { StopDetailPlayTTS } from '../../StopDetailPlayTTS';

/* * */

export function StopDetailNamesModalBody() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// . Render components

	return (
		<>
			<Section>

				<Grid columns="a" gap="md">
					<TextInput
						label="Nome Único da Paragem"
						value={stopDetailContext.data.form.getValues()?.name ?? 'N/A'}
						variant="bordered"
					/>
				</Grid>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Nome Curto"
						value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'}
						variant="bordered"
					/>

					<TextInput
						label="Nome TTS"
						value={stopDetailContext.data.form.getValues()?.tts_name ?? 'N/A'}
						variant="bordered"
					/>
				</Grid>

			</Section>

			<Section>
				<Grid columns="abc" gap="md">
					<Button label="Cancelar" onClick={stopDetailContext.actions.closeNameEditor} />
					<Button label="Salvar" onClick={stopDetailContext.actions.closeNameEditor} />
					<StopDetailPlayTTS />
				</Grid>
			</Section>
		</>
	);

	//
}

export function StopDetailNameModal() {
	//

	return (
		<Pane
			header={[
				<Toolbar key="stop-detail-names-toolbar">
					<Label size="lg" singleLine>Editar Nomes da Paragem</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
				<StopDetailNamesModalBody />
			</div>
		</Pane>
	);

	//
}
