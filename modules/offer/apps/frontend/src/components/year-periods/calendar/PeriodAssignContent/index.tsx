'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Alert, ColorInput, ColorSwatch, ErrorDisplay, MultiSelect, Radio, Section, Select, StandardFormController, Text, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { PeriodsAssignmentReview } from '../../shared/PeriodsAssignmentReview';
import { usePeriodsAgenciesData } from '../../shared/use-periods-agencies-data';
import { usePeriodAssignContext } from '../PeriodAssign.context';

/* * */

export function PeriodAssignContent() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { assignmentReview, availablePeriods, capabilities, conflictError, dateRangeInfo, form, values } = usePeriodAssignContext();
	const { error, isLoading, options } = usePeriodsAgenciesData({ permissions: {
		actions: [values.assignmentMode === 'create' ? PermissionCatalog.all.year_periods.actions.create : PermissionCatalog.all.year_periods.actions.update],
		scope: PermissionCatalog.all.year_periods.scope,
	} });
	const periodOptions = availablePeriods.map(period => ({
		icon: <ColorSwatch color={period.color || '#3b82f6'} size={14} />,
		label: period.name,
		value: period._id,
	}));
	const isDisabled = !capabilities.editEnabled;

	//
	// B. Render components

	return (
		<Section gap="md">
			<Text weight="semibold">{t('default:periods.assignment.range')}</Text>
			<Text size="sm">{dateRangeInfo.startDate} → {dateRangeInfo.endDate} ({t('default:periods.assignment.dayCount', { count: dateRangeInfo.dayCount })})</Text>
			{error && <ErrorDisplay message={error} />}
			<StandardFormController
				control={form.control}
				name="assignmentMode"
				render={({ field }) => (
					<Radio.Group label={t('default:periods.assignment.mode')} onChange={field.onChange} value={field.value}>
						<Radio disabled={isDisabled} label={t('default:periods.assignment.existing')} value="existing" />
						<Radio disabled={isDisabled} label={t('default:periods.assignment.create')} value="create" />
					</Radio.Group>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={options}
						disabled={isDisabled || isLoading || !!error}
						error={fieldState.error?.message}
						label={t('default:periods.fields.agency_ids.label')}
						value={field.value}
						onChange={(value) => {
							field.onChange(value);
							form.setValue('yearPeriodId', '');
						}}
						withAsterisk
					/>
				)}
			/>
			{values.assignmentMode === 'existing' ? (
				<>
					<StandardFormController
						control={form.control}
						name="yearPeriodId"
						render={({ field, fieldState }) => (
							<Select
								data={periodOptions}
								disabled={isDisabled || !periodOptions.length}
								error={fieldState.error?.message}
								label={t('default:periods.assignment.period')}
								onChange={value => field.onChange(value ?? '')}
								placeholder={t('default:periods.assignment.search')}
								value={field.value || null}
								withAsterisk
							/>
						)}
					/>
					{!!values.agency_ids.length && !periodOptions.length && <Alert variant="warning">{t('default:periods.assignment.noPeriods')}</Alert>}
				</>
			) : (
				<>
					<StandardFormController
						control={form.control}
						name="newPeriodName"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:periods.fields.name.label')}
								onChange={field.onChange}
								placeholder={t('default:periods.fields.name.placeholder')}
								readOnly={isDisabled}
								value={field.value}
								withAsterisk
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="color"
						render={({ field, fieldState }) => (
							<ColorInput
								error={fieldState.error?.message}
								label={t('default:periods.fields.color.label')}
								onChange={field.onChange}
								readOnly={isDisabled}
								value={field.value ?? ''}
								withEyeDropper={false}
							/>
						)}
					/>
				</>
			)}
			{conflictError && <ErrorDisplay message={conflictError} />}
			<PeriodsAssignmentReview disabled={isDisabled} review={assignmentReview} />
		</Section>
	);
}
