'use client';

/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { AnnotationsCreateContextProvider, useAnnotationsCreateContext } from '@/contexts/AnnotationsCreate.context';
import { AnnotationSchema } from '@tmlmobilidade/types';
import { Button, closeModal, Divider, Grid, Label, MeContextProvider, openModal, Section, Text, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export const CREATE_ANNOTATION_MODAL_ID = 'create-annotation-modal';

/* * */

export const openCreateAnnotationModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<AgenciesContextProvider>
					<AnnotationsCreateContextProvider>
						<CreateAnnotationModal />
					</AnnotationsCreateContextProvider>
				</AgenciesContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_ANNOTATION_MODAL_ID,
		padding: 0,
		size: 'lg',
		withCloseButton: false,
	});
};

/* * */

export default function CreateAnnotationModal() {
	//

	//
	// A. Setup variables

	const annotationsCreateContext = useAnnotationsCreateContext();

	//
	// B. Render Components

	return (
		<>

			<Section gap="xs">
				<Label size="lg" caps>Nova Anotação</Label>
				<Text size="sm">Crie uma anotação para registar eventos ou observações em datas específicas.</Text>
			</Section>

			<Divider />

			<Section gap="md">
				<TextInput
					label="Título"
					placeholder="Ex: Greve de transportes"
					required={!AnnotationSchema.shape.title.isOptional()}
					w="100%"
					{...annotationsCreateContext.data.form.getInputProps('title')}
				/>

				<Textarea
					label="Descrição"
					minRows={2}
					placeholder="Descreva o evento ou observação..."
					required={!AnnotationSchema.shape.description.isOptional()}
					w="100%"
					{...annotationsCreateContext.data.form.getInputProps('description')}
				/>

			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={annotationsCreateContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CREATE_ANNOTATION_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						disabled={annotationsCreateContext.flags.loading || !annotationsCreateContext.data.form.isValid()}
						label="Criar Anotação"
						loading={annotationsCreateContext.flags.loading}
						onClick={annotationsCreateContext.actions.createAnnotation}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
