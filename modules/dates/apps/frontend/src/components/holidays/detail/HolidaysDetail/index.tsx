'use client';

import { DatesSelector } from '@/components/holidays/detail/HolidaysDatesSelector';
import { useHolidaysDetailContext } from '@/components/holidays/detail/HolidaysDetail.context';
import { HolidaysDetailHeader } from '@/components/holidays/detail/HolidaysDetailHeader';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { HolidaySchema, PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, Grid, LoadingOverlay, MultiSelect, Pane, Section, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function HolidaysDetail() {
	//

	//
	// A. Setup variables

	const holidaysDetailContext = useHolidaysDetailContext();

	// Bypass permissions to show all agency labels in read-only mode
	// When editable, filter agencies based on user permissions
	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: holidaysDetailContext.flags.isReadOnly ? undefined : [PermissionCatalog.all.holidays.actions.update],
		scope: holidaysDetailContext.flags.isReadOnly ? undefined : PermissionCatalog.all.holidays.scope,
	});

	//
	// B. Render components

	if (holidaysDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (holidaysDetailContext.flags.error) {
		return <ErrorDisplay message={holidaysDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<HolidaysDetailHeader />]}>
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
