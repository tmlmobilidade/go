'use client';

/* * */

import { usePeriodAssignContext } from '@/components/periods/calendar/PeriodAssign.context';
import { usePeriodsListContext } from '@/components/periods/list/PeriodsList.context';
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Alert, Button, ColorInput, ColorSwatch, Label, Radio, Section, Select, Text, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export const ASSIGN_PERIOD_MODAL_ID = 'assign-period-modal';

/* * */

export function PeriodAssignContent() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();
	const periodAssignContext = usePeriodAssignContext();
	const { t } = useTranslation();

	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.periods.actions.update],
		scope: PermissionCatalog.all.periods.scope,
	});

	const agencyPeriods = useMemo(() => {
		if (!periodAssignContext.data.form.values.agency_id) return [];

		return periodsListContext.data.raw
			.filter(period => period.agency_id === periodAssignContext.data.form.values.agency_id)
			.map(period => ({
				icon: <ColorSwatch color={period.color || '#3b82f6'} size={14} />,
				label: period.name,
				value: period._id,
			}));
	}, [periodAssignContext.data.form.values.agency_id, periodsListContext.data.raw]);

	//
	// B. Render components

	return (
		<>

			{/* Date Range Summary */}
			<Section gap="md">
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<IconCalendar />
					<Label size="md">{t('dates:periods.calendar.PeriodAssignContent.DateRange.title')}</Label>
				</Section>

				<Text size="sm">
					{periodAssignContext.data.dateRangeInfo.startDate}
					{' → '}
					{periodAssignContext.data.dateRangeInfo.endDate}
					{' '}
					({periodAssignContext.data.dateRangeInfo.dayCount} {periodAssignContext.data.dateRangeInfo.dayCount === 1 ? t('dates:periods.calendar.PeriodAssignContent.DateRange.day') : t('dates:periods.calendar.PeriodAssignContent.DateRange.days')})
				</Text>
			</Section>

			{/* Agency Selection */}
			<Section gap="md">
				<Select data={agencyOptions} label={t('dates:periods.calendar.PeriodAssignContent.SelectAgency.fields.agency_id.label')} placeholder={t('dates:periods.calendar.PeriodAssignContent.SelectAgency.fields.agency_id.placeholder')} w="100%" {...periodAssignContext.data.form.getInputProps('agency_id')} />
			</Section>

			{periodAssignContext.data.form.values.agency_id && (
				<>

					{/* Assignment Mode */}
					<Section gap="md">
						<Label size="md">{t('dates:periods.calendar.PeriodAssignContent.AssignmentMode.title')}</Label>
						<Radio.Group
							{...periodAssignContext.data.form.getInputProps('assignmentMode')}
						>
							<Radio
								label={t('dates:periods.calendar.PeriodAssignContent.AssignmentMode.existing.label')}
								value="existing"
							/>
							<Radio
								label={t('dates:periods.calendar.PeriodAssignContent.AssignmentMode.create.label')}
								value="create"
							/>
						</Radio.Group>
					</Section>

					{/* Conditional Input based on mode */}
					<Section gap="md">
						{periodAssignContext.data.form.values.assignmentMode === 'existing' ? (
							<>
								<Label size="md">{t('dates:periods.calendar.PeriodAssignContent.SelectPeriod.title')}</Label>
								{agencyPeriods.length > 0 && (
									<Select
										data={agencyPeriods}
										placeholder={t('dates:periods.calendar.PeriodAssignContent.SelectPeriod.placeholder')}
										w="100%"
										{...periodAssignContext.data.form.getInputProps('periodId')}
									/>
								)}
								{agencyPeriods.length === 0 && (
									<Alert variant="warning">
										<Text size="sm">
											{t('dates:periods.calendar.PeriodAssignContent.SelectPeriod.no_periods_warning')}
										</Text>
									</Alert>
								)}
							</>
						) : (
							<>
								<Label size="md">{t('dates:periods.calendar.PeriodAssignContent.CreatePeriod.fields.name.label')}</Label>
								<TextInput
									placeholder={t('dates:periods.calendar.PeriodAssignContent.CreatePeriod.fields.name.placeholder')}
									w="100%"
									{...periodAssignContext.data.form.getInputProps('newPeriodName')}
								/>

								<ColorInput
									label={t('dates:periods.calendar.PeriodAssignContent.CreatePeriod.fields.color.label')}
									withEyeDropper={false}
									{...periodAssignContext.data.form.getInputProps('color')}
								/>
							</>
						)}
					</Section>

					{/* Conflict Warning */}
					{periodAssignContext.data.conflictWarning && !periodAssignContext.flags.conflictAcknowledged && (
						<Section gap="md">
							<Alert color="var(--color-primary)" icon={<IconAlertTriangle />} title={t('dates:periods.calendar.PeriodAssignContent.ConflictWarning.title')} variant="light" w="100%">
								<Section gap="md" padding="none">
									<Text size="sm">{periodAssignContext.data.conflictWarning}</Text>
									<Button
										label={t('dates:periods.calendar.PeriodAssignContent.ConflictWarning.acknowledge_button')}
										onClick={periodAssignContext.actions.acknowledgeConflicts}
										fullWidth
									/>
								</Section>
							</Alert>
						</Section>
					)}
				</>
			)}
		</>
	);

	//
}
