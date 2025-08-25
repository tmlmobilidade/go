'use client';

/* * */

import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, Divider, Grid, Label, MeContextProvider, openModal, Section, Text, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export default function CreateStopModal2() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<>
			<Section gap="xs">
				<Label size="lg" caps>Comfirmação de dados</Label>
				<Text>comfirme os dados abaixo para comfirmar a criação da paragem</Text>
			</Section>

			<Divider />

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<Section gap="sm">
				<Grid columns="abcd">
					<ValueDisplay label="Nome da Paragem" value={stopCreateContext.data.newStopState.name} raised />
					<ValueDisplay label="Nome curto" value={stopCreateContext.data.newStopState.short_name} raised />
					<ValueDisplay label="Nome tts" value={stopCreateContext.data.newStopState.tts_name} raised />
					<ValueDisplay label="Latitude" value={stopCreateContext.data.newStopState.latitude} raised />
					<ValueDisplay label="Longitude" value={stopCreateContext.data.newStopState.longitude} raised />
					<ValueDisplay label="Distrito" value={stopCreateContext.data.newStopState.district} raised />
					<ValueDisplay label="Municipio" value={stopCreateContext.data.newStopState.municipality} raised />
					<ValueDisplay label="Freguesia" value={stopCreateContext.data.newStopState.parish} raised />

				</Grid>
			</Section>
			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={stopCreateContext.flags.loading}
						label="Voltar"
						onClick={openCreateStopInfosModal}
						variant="secondary"
					/>
					<Button
						disabled={!stopCreateContext.flags.can_create}
						label="Criar Paragem"
						loading={stopCreateContext.flags.loading}
						onClick={stopCreateContext.actions.createStop}
					/>
				</Grid>
			</Section>
		</>
	);
}
