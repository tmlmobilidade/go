'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Button, Grid, Label, Modal, Pane, Section, Spacer, TextInput, Toolbar } from '@tmlmobilidade/ui';

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
						onChange={event => stopDetailContext.data.form.setFieldValue('name', event.target.value)}
						value={stopDetailContext.data.form.getValues()?.name ?? 'N/A'}
						variant="bordered"
					/>
				</Grid>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Nome Curto"
						onChange={event => stopDetailContext.data.form.setFieldValue('short_name', event.target.value)}
						value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'}
						variant="bordered"
					/>

					<TextInput
						label="Nome TTS"
						onChange={event => stopDetailContext.data.form.setFieldValue('tts_name', event.target.value)}
						value={stopDetailContext.data.form.getValues()?.tts_name ?? 'N/A'}
						variant="bordered"
					/>
				</Grid>

			</Section>

			<Section>
				<Grid columns="abc" gap="md">
					<Button label="Cancelar" onClick={stopDetailContext.actions.closeNamesEditor} />
					<Button label="Salvar" onClick={stopDetailContext.actions.save} />
				</Grid>
			</Section>
		</>
	);

	//
}

export function StopDetailNamesModal() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Modal onClose={stopDetailContext.actions.closeNamesEditor} opened={stopDetailContext.flags.isNamesEditorOpen} size="xl">
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
		</Modal>
	);

	//
}
