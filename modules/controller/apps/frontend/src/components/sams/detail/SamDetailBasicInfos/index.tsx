/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useSamsDetailContext } from '@/contexts/SamDetail.context';
import { translateFilterValue } from '@/lib/translations';
import { formatUnixTimestampToDateString } from '@/lib/utils';
import { Collapsible, ErrorDisplay, Grid, LoadingOverlay, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailBasicInfos() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samDetailContext = useSamsDetailContext();
	const agenciesContext = useAgenciesContext();

	if (samDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (samDetailContext.flags.error) {
		return <ErrorDisplay message={samDetailContext.flags.error.message} />;
	}

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:sams.detail.SamsDetailBasicInfos.description')}
			title={t('default:sams.detail.SamsDetailBasicInfos.title')}
			defaultOpen
		>
			<Section>
				<Grid columns="abc" gap="lg">
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.agency_id.label')} value={agenciesContext.data.raw.find(agency => agency._id === samDetailContext.data.sam?.agency_id)?.name} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.seen_first_at.label')} value={formatUnixTimestampToDateString(samDetailContext.data.sam?.seen_first_at)} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.seen_last_at.label')} value={formatUnixTimestampToDateString(samDetailContext.data.sam?.seen_last_at)} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_expected.label')} value={samDetailContext.data.sam?.transactions_expected?.toString() ?? '-'} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_found.label')} value={samDetailContext.data.sam?.transactions_found?.toString() ?? '-'} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_missing.label')} value={samDetailContext.data.sam?.transactions_missing?.toString() ?? '-'} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.status.label')} value={translateFilterValue('sams_status', samDetailContext.data.status ?? '')} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.system_status.label')} value={translateFilterValue('sams_status', samDetailContext.data.sam?.system_status)} variant="bordered" />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.latest_apex_version.label')} value={samDetailContext.data.sam?.latest_apex_version ?? 'N/A'} variant="bordered" />
				</Grid>
			</Section>

		</Collapsible>
	);
}
