/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { Collapsible, ErrorDisplay, Grid, LoadingOverlay, Section, ValueDisplay } from '@tmlmobilidade/ui';
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
					<ValueDisplay label={t('default:sams.detail.SamsDetailBasicInfos.fields.latest_apex_version.label')} value={samDetailContext.data.sam?.latest_apex_version} />
				</Grid>
			</Section>
		</Collapsible>
	);
}
