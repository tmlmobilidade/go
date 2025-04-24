/* * */

import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { Collapsible, Combobox, DatePicker, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

/* * */

export function PlanDetailSectionInfo() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Transform data
	const validFrom = useMemo(() => {
		if (!planDetailContext.data.form.values.valid_from) return null;
		return Dates.fromOperationalDate(planDetailContext.data.form.values.valid_from).jsDate;
	}, [planDetailContext.data.form.values.valid_from]);

	const validUntil = useMemo(() => {
		if (!planDetailContext.data.form.values.valid_until) return null;
		return Dates.fromOperationalDate(planDetailContext.data.form.values.valid_until).jsDate;
	}, [planDetailContext.data.form.values.valid_until]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações gerais sobre o plano, como operador, data de vigência, etc."
			title="Informação do plano"
		>
			<Section gap="md">
				<Combobox
					aria-label="Agência"
					data={planDetailContext.data.agencies}
					label="Agência"
					fullWidth
					{...planDetailContext.data.form.getInputProps('agency_id')}
				/>
				<Grid columns="ab" gap="md">
					<DatePicker
						description="Data de início da vigência do plano"
						flex={1}
						label="Data de início"
						{...planDetailContext.data.form.getInputProps('valid_from')}
						value={validFrom}
						onChange={(date) => {
							planDetailContext.data.form.setValues({
								valid_from: Dates.fromJSDate(date).setZone('Europe/Lisbon').operationalDate,
							});
						}}
						withAsterisk
					/>
					<DatePicker
						description="Data de fim da vigência do plano"
						label="Data de fim"
						clearable
						{...planDetailContext.data.form.getInputProps('valid_until')}
						value={validUntil}
						onChange={(date) => {
							console.log('date', date);
							planDetailContext.data.form.setValues({
								valid_until: Dates.fromJSDate(date).setZone('Europe/Lisbon').operationalDate,
							});
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
