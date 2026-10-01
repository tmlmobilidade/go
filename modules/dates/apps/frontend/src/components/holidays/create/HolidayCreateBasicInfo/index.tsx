'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-users-agencies-data';
import { useHolidayCreateContext } from '@/components/holidays/create/HolidayCreate.context';
import { HolidaySchema } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function HolidayCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const holidayCreateContext = useHolidayCreateContext();

	const { options: allAgencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				key={holidayCreateContext.data.form.key('title')}
				label="Título"
				placeholder="Ex: 25 de Abril"
				required={!HolidaySchema.shape.title.isOptional()}
				w="100%"
				{...holidayCreateContext.data.form.getInputProps('title')}
			/>

			<Textarea
				key={holidayCreateContext.data.form.key('description')}
				label="Descrição"
				minRows={2}
				placeholder="Descreva o evento ou observação..."
				required={!HolidaySchema.shape.description.isOptional()}
				w="100%"
				{...holidayCreateContext.data.form.getInputProps('description')}
			/>

			<MultiSelect
				key={holidayCreateContext.data.form.key('agency_ids')}
				data={allAgencyOptions}
				label="Operadores afetados"
				w="100%"
				{...holidayCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
