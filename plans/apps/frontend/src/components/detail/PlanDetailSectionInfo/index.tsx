/* * */

import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { Collapsible, Combobox, DatePicker, Grid, Section } from '@tmlmobilidade/ui';
import { getOperationalDate, operationalDateToJsDate } from '@tmlmobilidade/utils';
import { DateTime } from 'luxon';
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
		return operationalDateToJsDate(planDetailContext.data.form.values.valid_from);
	}, [planDetailContext.data.form.values.valid_from]);

	const validUntil = useMemo(() => {
		if (!planDetailContext.data.form.values.valid_until) return null;
		return operationalDateToJsDate(planDetailContext.data.form.values.valid_until);
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
								valid_from: getOperationalDate(DateTime.fromJSDate(date)),
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
								valid_until: getOperationalDate(DateTime.fromJSDate(date, { zone: 'Europe/Lisbon' })),
							});
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
