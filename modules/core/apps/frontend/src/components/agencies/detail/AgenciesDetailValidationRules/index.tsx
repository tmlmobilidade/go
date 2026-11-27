'use client';

import { CloseButton, Collapsible, PanesManager, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAgenciesDetailAgencyId } from '../use-agencies-detail-agency-id';
import { AgenciesDetailValidationRuleInspector } from './AgenciesDetailValidationRuleInspector';
import { AgenciesDetailValidationRulesContextProvider } from './AgenciesDetailValidationRules.context';
import { AgenciesDetailValidationRulesFilters } from './AgenciesDetailValidationRulesFilters';
import { AgenciesDetailValidationRulesGraph } from './AgenciesDetailValidationRulesGraph';
import { AgenciesDetailValidationRulesTable } from './AgenciesDetailValidationRulesTable';

/* * */

export function AgenciesDetailValidationRules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { agencyId } = useAgenciesDetailAgencyId();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.ValidationRules.description')}
			title={t('default:agencies.detail.ValidationRules.title')}
		>
			<AgenciesDetailValidationRulesContextProvider key={agencyId}>
				<Section className={styles.container} gap="md">
					<PanesManager
						id="agencies-validation-rules"
						stackBelow={650}
						panes={[
							<Section key="rules" className={styles.pane} gap="md" padding="none">
								<AgenciesDetailValidationRulesFilters />
								<AgenciesDetailValidationRulesTable />
							</Section>,
							<Section key="details" className={styles.pane} gap="md" padding="none">
								<AgenciesDetailValidationRuleInspector />
							</Section>,
						]}
					/>
					<AgenciesDetailValidationRulesGraph />
				</Section>
			</AgenciesDetailValidationRulesContextProvider>
		</Collapsible>
	);
}
