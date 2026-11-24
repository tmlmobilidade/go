'use client';

import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAgenciesDetailAgencyId } from '../use-agencies-detail-agency-id';
import { AgenciesDetailValidationRuleInspector } from './AgenciesDetailValidationRuleInspector';
import { AgenciesDetailValidationRulesContextProvider } from './AgenciesDetailValidationRules.context';
import { AgenciesDetailValidationRulesFilters } from './AgenciesDetailValidationRulesFilters';
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
				<Section>
					<div className={styles.container}>
						<div className={styles.workspace}>
							<div className={styles.list}>
								<AgenciesDetailValidationRulesFilters />
								<AgenciesDetailValidationRulesTable />
							</div>
							<div className={styles.inspector}>
								<AgenciesDetailValidationRuleInspector />
							</div>
						</div>
					</div>
				</Section>
			</AgenciesDetailValidationRulesContextProvider>
		</Collapsible>
	);
}
