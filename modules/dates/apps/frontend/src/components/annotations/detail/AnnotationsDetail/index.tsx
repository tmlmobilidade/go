'use client';

/* * */

import { AnnotationsDetailHeader } from '@/components/annotations/detail/AnnotationsDetailHeader';
import { AgencyMultiselect } from '@/components/common/AgencyMultiselect';
import { DatesSelector } from '@/components/common/DatesSelector';
import { useAnnotationsDetailContext } from '@/contexts/AnnotationsDetail.context';
import { AnnotationSchema } from '@tmlmobilidade/types';
import { ErrorDisplay, LoadingOverlay, Pane, Section, Text, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsDetail() {
	//

	//
	// A. Setup variables

	const annotationsDetailContext = useAnnotationsDetailContext();

	//
	// B. Render components

	if (annotationsDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (annotationsDetailContext.flags.error) {
		return <ErrorDisplay message={annotationsDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<AnnotationsDetailHeader />]}>
			<Section gap="lg">

				<TextInput
					label="Título"
					placeholder="Ex: Greve de transportes"
					readOnly={annotationsDetailContext.flags.read_only}
					required={!AnnotationSchema.shape.title.isOptional()}
					w="100%"
					{...annotationsDetailContext.data.form.getInputProps('title')}
				/>

				<Textarea
					label="Descrição"
					placeholder="Descrição da ocorrência"
					readOnly={annotationsDetailContext.flags.read_only}
					required={!AnnotationSchema.shape.description.isOptional()}
					w="100%"
					{...annotationsDetailContext.data.form.getInputProps('description')}
				/>

				<AgencyMultiselect
					label="Operadores afetados"
					readOnly={annotationsDetailContext.flags.read_only}
					selected={annotationsDetailContext.data.form.values.agency_ids || []}
					{...annotationsDetailContext.data.form.getInputProps('agency_ids')}
				/>

				<Text>Selecione as datas da ocorrência</Text>
				<DatesSelector />

			</Section>
		</Pane>
	);

	//
}
