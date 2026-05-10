'use client';

import { DatesSelector } from '@/components/annotations/detail/AnnotationsDatesSelector';
import { useAnnotationsDetailContext } from '@/components/annotations/detail/AnnotationsDetail.context';
import { AnnotationsDetailHeader } from '@/components/annotations/detail/AnnotationsDetailHeader';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { AnnotationSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, Grid, LoadingOverlay, MultiSelect, Pane, Section, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsDetail() {
	//

	//
	// A. Setup variables

	const annotationsDetailContext = useAnnotationsDetailContext();

	// Bypass permissions to show all agency labels in read-only mode
	// When editable, filter agencies based on user permissions
	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: annotationsDetailContext.flags.isReadOnly ? undefined : [PermissionCatalog.all.annotations.actions.update],
		scope: annotationsDetailContext.flags.isReadOnly ? undefined : PermissionCatalog.all.annotations.scope,
	});

	//
	// B. Render components

	if (annotationsDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (annotationsDetailContext.flags.error) {
		return <ErrorDisplay message={annotationsDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<AnnotationsDetailHeader />]}>
			<Section>
				<Grid columns="a" gap="lg">

					<TextInput
						label="Título"
						placeholder="Ex: Greve de transportes"
						readOnly={annotationsDetailContext.flags.isReadOnly}
						required={!AnnotationSchema.shape.title.isOptional()}
						w="100%"
						{...annotationsDetailContext.data.form.getInputProps('title')}
					/>

					<Textarea
						label="Descrição"
						placeholder="Descrição da ocorrência"
						readOnly={annotationsDetailContext.flags.isReadOnly}
						required={!AnnotationSchema.shape.description.isOptional()}
						w="100%"
						{...annotationsDetailContext.data.form.getInputProps('description')}
					/>

					<MultiSelect
						data={agencyOptions}
						disabled={annotationsDetailContext.flags.isReadOnly}
						label="Operadores afetados"
						value={annotationsDetailContext.data.form.values.agency_ids || []}
						{...annotationsDetailContext.data.form.getInputProps('agency_ids')}
					/>

					<DatesSelector />

				</Grid>
			</Section>
		</Pane>
	);

	//
}
