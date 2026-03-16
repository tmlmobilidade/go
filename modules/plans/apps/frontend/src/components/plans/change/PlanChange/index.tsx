'use client';

/* * */

import { usePlanChangeContext } from '@/components/plans/change/PlanChange.context';
import { PlanChangeHeader } from '@/components/plans/change/PlanChangeHeader';
import { IconCheck } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { Grid, IdTag, Label, Pane, Section, Select, type SelectProps } from '@tmlmobilidade/ui';
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
		return changePlanContext.data.available_validations.map(item => ({
			icon: <IdTag id={item._id} />,
			label: `Submetida a ${Dates.fromUnixTimestamp(item.created_at).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_MEDIUM, 'pt-PT')}`,
			value: item._id,
		}));
	}, [changePlanContext.data.available_validations]);

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
					<Select
						data={availableValidationsOptions}
						label="Selecione uma validação para substituir o plano atual"
						onChange={changePlanContext.actions.setSelectedValidationId}
						renderOption={renderSelectOption}
						value={changePlanContext.data.selected_validation_id}
					/>
				</Grid>
			</Section>
		</Pane>
	);

	//
}
