'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { IconCalendar } from '@tabler/icons-react';
import { Button, Section, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RuleCreateFooter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const ruleCreateContext = useRuleCreateContext();

	//
	// B. Handle actions

	const handleShowAffectedDates = () => {
		ruleCreateContext.actions.openDrawer();
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<Section alignItems="center" flexDirection="row" padding="none">
				<IconCalendar size={20} />
				<Button
					c="var(--color-system-text-100)"
					className={styles.previewLink}
					label={t('default:scheduling.copy.affectedDays', '', { count: ruleCreateContext.data.ruleImpact?.count ?? 0 })}
					onClick={handleShowAffectedDates}
					variant="transparent"
				/>
			</Section>

			<Button label={t('default:scheduling.copy.cancel')} onClick={closeCreateRuleModal} variant="danger" />
			<Button
				disabled={!ruleCreateContext.capabilities.createEnabled}
				label={ruleCreateContext.flags.isEditing ? t('default:scheduling.copy.edit') : t('default:scheduling.copy.create')}
				onClick={ruleCreateContext.actions.submitRule}
			/>

		</Toolbar>
	);

	//
}
