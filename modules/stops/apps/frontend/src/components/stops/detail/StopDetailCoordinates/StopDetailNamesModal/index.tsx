'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetailCoordinates.modal';
import { Label, Pane, Section, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function StopDetailNamesModalBody() {
	//

	//
	// A. Setup variables

	useStopDetailContext();

	//
	// B. Render components

	return (
		<>
			<Section>
				{/* <Grid columns="ab" gap="md">
					<ValueDisplay
						label="Nome Curto"
						value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'}
						variant="bordered"
					/>
					<ValueDisplay
						className={canEditStopName ? styles['coords-label'] : undefined}
						icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome TTS"
						onClick={canEditStopName ? stopDetailContext.actions.openNameEditor : undefined}
						value={stopDetailContext.data.form.values.tts_name ?? 'N/A'}
						variant="bordered"
						{...stopDetailContext.data.form.getInputProps('tts_name')}
					/>
				</Grid> */}
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
					<Label size="lg" singleLine>Editar Nomes</Label>
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
