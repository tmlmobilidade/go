'use client';

import { usePlanChangeContext } from '@/components/plans/change/PlanChangeForm.context';
import { PlanChangeHeader } from '@/components/plans/change/PlanChangeHeader';
import { IconCheck } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { Grid, IdTag, Label, Pane, Section, Select, type SelectProps, StandardFormController } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlanChange() {
	//

	//
	// A. Setup variables

	const changePlanContext = usePlanChangeContext();

	//
	// B. Transform data

	const availableValidationsOptions = useMemo(() => {
		return changePlanContext.data.availableValidations.map(item => ({
			icon: <IdTag id={item._id} />,
			label: `Submetida a ${Dates.fromUnixTimestamp(item.created_at).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_MEDIUM, 'pt-PT')}`,
			value: item._id,
		}));
	}, [changePlanContext.data.availableValidations]);

	//
	// C. Render components

	const renderSelectOption: SelectProps['renderOption'] = ({ checked, option }) => (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="sm">
			<IdTag id={option.value} />
			<Label size="md" singleLine>{option.label}</Label>
			{checked && <IconCheck />}
		</Section>
	);

	return (
		<Pane header={[<PlanChangeHeader key="header" />]}>
			<Section>
				<Grid gap="md">
					<StandardFormController
						control={changePlanContext.form.control}
						name="validation_id"
						render={({ field, fieldState }) => (
							<Select
								clearable={false}
								data={availableValidationsOptions}
								disabled={!changePlanContext.capabilities?.editEnabled}
								error={fieldState.error?.message}
								label="Selecione uma validação para substituir o plano atual"
								onBlur={field.onBlur}
								onChange={value => field.onChange(value)}
								renderOption={renderSelectOption}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Pane>
	);

	//
}
