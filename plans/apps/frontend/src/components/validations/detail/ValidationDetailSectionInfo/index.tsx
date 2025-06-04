/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Collapsible, Combobox, DatePicker, Grid, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

/* * */

export function ValidationDetailSectionInfo() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	//
	// B. Transform data
	const validFrom = useMemo(() => {
		if (!validationDetailContext.data.form.values.valid_from) return null;
		return Dates.fromOperationalDate(validationDetailContext.data.form.values.valid_from, 'local').js_date;
	}, [validationDetailContext.data.form.values.valid_from]);

	const validUntil = useMemo(() => {
		if (!validationDetailContext.data.form.values.valid_until) return null;
		return Dates.fromOperationalDate(validationDetailContext.data.form.values.valid_until, 'local').js_date;
	}, [validationDetailContext.data.form.values.valid_until]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações gerais sobre o validação, como operador, data de vigência, etc."
			title="Informação do validação"
		>
			<Section gap="md">
				<Combobox
					aria-label="Agência"
					data={validationDetailContext.data.agencies}
					label="Agência"
					fullWidth
					{...validationDetailContext.data.form.getInputProps('agency_id')}
				/>
				<Grid columns="ab" gap="md">
					<DatePicker
						description="Data de início da vigência do validação"
						flex={1}
						label="Data de início"
						{...validationDetailContext.data.form.getInputProps('valid_from')}
						value={validFrom}
						onChange={(date) => {
							validationDetailContext.data.form.setValues({
								valid_from: Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date,
							});
						}}
						withAsterisk
					/>
					<DatePicker
						description="Data de fim da vigência do validação"
						label="Data de fim"
						clearable
						{...validationDetailContext.data.form.getInputProps('valid_until')}
						value={validUntil}
						onChange={(date) => {
							console.log('date', date);
							validationDetailContext.data.form.setValues({
								valid_until: Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date,
							});
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
