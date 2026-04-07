/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { formatUnixTimestampToDateString } from '@/lib/utils';
import { Collapsible, ErrorDisplay, Grid, LoadingOverlay, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailBasicInfos() {
	//

	//
	// A. Setup variables

	const samDetailContext = useSamsDetailContext();
	const { t } = useTranslation();
	const agenciesContext = useAgenciesContext();

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
				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.agency_id.label')} value={agenciesContext.data.raw.find(agency => agency._id === samDetailContext.data.sam?.agency_id)?.name} raised />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.seen_first_at.label')} value={formatUnixTimestampToDateString(samDetailContext.data.sam?.seen_first_at)} raised />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.seen_last_at.label')} value={formatUnixTimestampToDateString(samDetailContext.data.sam?.seen_last_at)} raised />
				</Grid>
				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_expected.label')} value={samDetailContext.data.sam?.transactions_expected?.toString() ?? '-'} raised />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_found.label')} value={samDetailContext.data.sam?.transactions_found?.toString() ?? '-'} raised />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.transactions_missing.label')} value={samDetailContext.data.sam?.transactions_missing?.toString() ?? '-'} raised />
				</Grid>
				<Grid columns="ab" gap="md">
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.system_status.label')} value={samDetailContext.data.sam?.system_status} raised />
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.latest_apex_version.label')} value={samDetailContext.data.sam?.latest_apex_version ?? '-'} raised />
				</Grid>
			</Section>

		</Collapsible>
	);
}
