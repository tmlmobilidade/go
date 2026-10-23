'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, ErrorDisplay, keepUrlParams, LoadingOverlay, Pane, Section } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { PeriodsDetailBasicInfo } from '../PeriodsDetailBasicInfo';
import { PeriodsDetailHeader } from '../PeriodsDetailHeader';
import { usePeriodsDetailData } from '../use-periods-detail-data';

/* * */

export function PeriodsDetail() {
	//

	//
	// A. Setup variables

	const { data, error, isLoading } = usePeriodsDetailData();
	const router = useRouter();
	const { t } = useTranslation();
	const handleOpenCalendar = () => router.push(keepUrlParams(PAGE_ROUTES.offer.YEAR_PERIODS_DATES_DETAIL(data?._id ?? '')));

	//
	// B. Render components

	if (error) return <ErrorDisplay message={error} />;
	if (isLoading || !data) return <LoadingOverlay />;

	return (
		<Pane header={[<PeriodsDetailHeader key="header" />]}>
			<Section gap="lg">
				<PeriodsDetailBasicInfo />
				<Button label={t('default:periods.detail.openCalendar')} onClick={handleOpenCalendar} />
			</Section>
		</Pane>
	);
}
