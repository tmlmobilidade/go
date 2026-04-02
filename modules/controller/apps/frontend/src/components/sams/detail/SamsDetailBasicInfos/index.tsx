/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { Collapsible, ErrorDisplay, Grid, LoadingOverlay, NumberInput, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailBasicInfos() {
	//

	//
	// A. Setup variables

	const samDetailContext = useSamsDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	if (samDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (samDetailContext.flags.error) {
		return <ErrorDisplay message={samDetailContext.flags.error.message} />;
	}

	return (
		<Collapsible
			description={t('default:sams.detail.SamsDetailBasicInfos.description')}
			title={t('default:sams.detail.SamsDetailBasicInfos.title')}
			defaultOpen
		>
			<Section>
				<Grid columns="ab" gap="md">
					<NumberInput
						key={samDetailContext.data.sam._id.toString() + 'transactions_expected'}
						label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_expected.label')}
						value={samDetailContext.data.sam?.transactions_expected}
						readOnly
					/>
					<NumberInput
						key={samDetailContext.data.sam._id.toString() + 'transactions_found'}
						label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_found.label')}
						value={samDetailContext.data.sam?.transactions_found}
						readOnly
					/>
					<NumberInput
						key={samDetailContext.data.sam._id.toString() + 'transactions_missing'}
						label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_missing.label')}
						value={samDetailContext.data.sam?.transactions_missing}
						readOnly
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
