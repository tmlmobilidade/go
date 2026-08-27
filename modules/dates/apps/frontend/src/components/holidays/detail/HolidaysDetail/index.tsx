'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-users-agencies-data';
import { DatesSelector } from '@/components/holidays/detail/HolidaysDatesSelector';
import { useHolidaysDetailContext } from '@/components/holidays/detail/HolidaysDetail.context';
import { HolidaysDetailHeader } from '@/components/holidays/detail/HolidaysDetailHeader';
import { HolidaySchema } from '@tmlmobilidade/go-types-offer';
import { ErrorDisplay, Grid, LoadingOverlay, MultiSelect, Pane, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function HolidaysDetail() {
	//

	//
	// A. Setup variables

	const holidaysDetailContext = useHolidaysDetailContext();

	// Bypass permissions to show all agency labels in read-only mode
	// When editable, filter agencies based on user permissions
	const { options: agencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render components

	if (holidaysDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (holidaysDetailContext.flags.error) {
		return <ErrorDisplay message={holidaysDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<HolidaysDetailHeader key="header" />]}>
			<Section>
				<Grid columns="a" gap="lg">

					<TextInput
						label="Título"
						placeholder="Ex: Greve de transportes"
						readOnly={holidaysDetailContext.flags.isReadOnly}
						required={!HolidaySchema.shape.title.isOptional()}
						w="100%"
						{...holidaysDetailContext.data.form.getInputProps('title')}
					/>

					<Textarea
						label="Descrição"
						placeholder="Descrição da ocorrência"
						readOnly={holidaysDetailContext.flags.isReadOnly}
						required={!HolidaySchema.shape.description.isOptional()}
						w="100%"
						{...holidaysDetailContext.data.form.getInputProps('description')}
					/>

					<MultiSelect
						data={agencyOptions}
						disabled={holidaysDetailContext.flags.isReadOnly}
						label="Operadores afetados"
						value={holidaysDetailContext.data.form.values.agency_ids || []}
						{...holidaysDetailContext.data.form.getInputProps('agency_ids')}
					/>

					<DatesSelector />

				</Grid>
			</Section>
		</Pane>
	);

	//
}
