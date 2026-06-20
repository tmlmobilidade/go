'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { closeCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { CloseButton, DeleteButton, Section, Tag, Toolbar } from '@tmlmobilidade/ui';

import { ParameterCreateSummaryCard } from '../ParameterCreateSummaryCard';

/* * */

export function ParameterCreateHeader() {
	//

	//
	// A. Setup variables

	const ruleCreateContext = useParameterCreateContext();
	const isDefaultRule = ruleCreateContext.data.form?.values.kind === 'default';

	//
	// B. Render components

	return (
		<Toolbar>
			<Section gap="sm" padding="none">
				<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">

					<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
						<CloseButton onClick={closeCreateParameterModal} type="close" />
						<Tag label={ruleCreateContext.data.parameterForUI.name || 'Nova Regra'} variant="muted" />
					</Section>

					{!isDefaultRule && ruleCreateContext.flags.isEditing && ruleCreateContext.actions.deleteParameter && (
						<DeleteButton onDelete={ruleCreateContext.actions.deleteParameter} />
					)}

				</Section>

				<ParameterCreateSummaryCard />
			</Section>

		</Toolbar>
	);

	//
}
