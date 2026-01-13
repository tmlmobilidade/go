'use client';

/* * */

import { usePeriodsDetailContext } from '@/components/periods/detail/PeriodsDetail.context';
import { PeriodsDetailHeader } from '@/components/periods/detail/PeriodsDetailHeader';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PeriodSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, ColorInput, ErrorDisplay, LoadingOverlay, Pane, Section, Select, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodsDetail() {
	//

	//
	// A. Setup variables

	const periodsDetailContext = usePeriodsDetailContext();
	const router = useRouter();
	const { t } = useTranslation();

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.periods.actions.create],
		scope: PermissionCatalog.all.periods.scope,
	});

	//
	// B. Handle actions

	const openCalendar = () => {
		router.push(PAGE_ROUTES.dates.PERIODS_LIST);
	};

	//
	// C. Render components

	if (periodsDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (periodsDetailContext.flags.error) {
		return <ErrorDisplay message={periodsDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PeriodsDetailHeader />]}>
			<Section gap="lg">

				<TextInput
					label={t('dates:periods.detail.PeriodsDetailBasicInfo.fields.name.label')}
					placeholder={t('dates:periods.detail.PeriodsDetailBasicInfo.fields.name.placeholder')}
					readOnly={periodsDetailContext.flags.isReadOnly}
					required={!PeriodSchema.shape.name.isOptional()}
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('name')}
				/>

				<Select
					key={periodsDetailContext.data.form.key('agency_id')}
					data={allAgencyOptions}
					disabled={periodsDetailContext.flags.isReadOnly}
					label={t('dates:periods.detail.PeriodsDetailBasicInfo.fields.agency_id.label')}
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('agency_id')}
				/>

				<ColorInput
					key={periodsDetailContext.data.form.key('color')}
					label={t('dates:periods.detail.PeriodsDetailBasicInfo.fields.color.label')}
					readOnly={periodsDetailContext.flags.isReadOnly}
					required={!PeriodSchema.shape.color.isOptional()}
					withEyeDropper={false}
					{...periodsDetailContext.data.form.getInputProps('color')}
				/>

				<Button label={t('dates:periods.detail.PeriodsDetailBasicInfo.AssignDatesButton.label')} onClick={openCalendar} />

			</Section>
		</Pane>
	);

	//
}
