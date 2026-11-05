'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { RuleTimepointCount } from '@/components/patterns/rules/shared/RuleTimepointCount';
import { RuleLabelTag } from '@/components/shared/rules/RuleLabelTag';
import { IconCopy } from '@tabler/icons-react';
import { CloseButton, DeleteButton, IconButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
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
			<RuleLabelTag label={ruleCreateContext.data.ruleSummary.label} />
			<RuleTimepointCount count={ruleCreateContext.data.values.timepoints?.length ?? 0} />

			<Spacer shrink />

			{ruleCreateContext.flags.isEditing && ruleCreateContext.actions.duplicateRule && (
				<IconButton
					icon={<IconCopy size={20} />}
					onClick={ruleCreateContext.actions.duplicateRule}
					tooltip={t('default:scheduling.copy.duplicate')}
				/>
			)}

			{ruleCreateContext.flags.isEditing && ruleCreateContext.actions.deleteRule && (
				<DeleteButton
					confirmMessage={t('default:scheduling.copy.deleteRuleWarning')}
					confirmTitle={t('default:scheduling.copy.deleteRuleTitle')}
					onDelete={ruleCreateContext.actions.deleteRule}
					showConfirmation
				/>
			)}

		</Toolbar>
	);

	//
}
