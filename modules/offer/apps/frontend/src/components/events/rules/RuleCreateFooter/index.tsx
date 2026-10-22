'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/events/rules/RuleCreate.modal';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateFooter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ruleCreateContext = useRuleCreateContext();

	//
	// B. Handle actions

	//
	// C. Render components

	return (
		<Toolbar>
			<Spacer />

			<Button label={t('default:events.ruleEditor.cancel')} onClick={closeCreateRuleModal} variant="danger" />
			<Button
				disabled={!ruleCreateContext.isValid}
				label={ruleCreateContext.isEditing ? t('default:events.ruleEditor.edit') : t('default:events.ruleEditor.create')}
				onClick={ruleCreateContext.actions.create}
			/>
		</Toolbar>
	);

	//
}
