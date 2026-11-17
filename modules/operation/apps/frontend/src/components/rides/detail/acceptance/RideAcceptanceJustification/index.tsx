'use client';

import { type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { HasPermission, Section, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import acceptanceStyles from '../RideAcceptance/styles.module.css';

import { RideAcceptanceJustificationEditable } from '../RideAcceptanceJustificationEditable';
import { RideAcceptanceJustificationReadOnly } from '../RideAcceptanceJustificationReadOnly';

/* * */

export function RideAcceptanceJustification({ acceptance }: { acceptance: RideAcceptance }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const readOnly = <RideAcceptanceJustificationReadOnly justification={acceptance.justification} />;

	//
	// C. Render components

	return (
		<Surface className={acceptanceStyles.card}>
			<Section gap="md" padding="lg">
				<h2 className={acceptanceStyles.cardTitle}>{t('default:rides.acceptance.RideAcceptanceJustification.title')}</h2>
				{acceptance.acceptance_status === RideAcceptanceStatusSchema.enum.justification_required ? (
					<HasPermission action={PermissionCatalog.all.rides.actions.acceptance_justify} fallback={readOnly} scope={PermissionCatalog.all.rides.scope}>
						<RideAcceptanceJustificationEditable />
					</HasPermission>
				) : readOnly}
			</Section>
		</Surface>
	);

	//
}
