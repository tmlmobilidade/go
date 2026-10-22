'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/events/rules/RuleCreate.modal';
import { CloseButton, DeleteButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ruleCreateContext = useRuleCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRuleModal} type="close" />
			<Tag label={t('default:events.ruleEditor.newRule')} variant="muted" />

			<Spacer />

			{ruleCreateContext.isEditing && ruleCreateContext.actions.delete && (
				<DeleteButton onDelete={ruleCreateContext.actions.delete} />
			)}

		</Toolbar>
	);

	//
}
