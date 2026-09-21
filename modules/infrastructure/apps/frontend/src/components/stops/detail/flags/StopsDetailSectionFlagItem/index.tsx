'use client';

import { useStopsAgenciesData } from '@/components/stops/shared/use-stops-agencies-data';
import { IconEqual, IconEqualNot } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Checkbox, DeleteButton, Grid, MultiSelect, Section, StandardFormController, Surface, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';

/* * */

interface StopsDetailSectionFlagItemProps {
	index: number
}

/* * */

export function StopsDetailSectionFlagItem({ index }: StopsDetailSectionFlagItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useStopsDetailFormContext();

	const { data } = useStopsDetailData();

	const flagsValues = useStandardFormWatch({ control: form.control, name: 'flags' });

	//
	// B. Fetch data

	const { options: agenciesOptions } = useStopsAgenciesData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.read, PermissionCatalog.all.stops.actions.update], scope: PermissionCatalog.all.stops.scope },
	});

	//
	// C. Transform data

	const flagIsHarmonized = useMemo(() => {
		return flagsValues?.[index]?.is_harmonized;
	}, [flagsValues, index]);

	const flagIdMatchesStopId = useMemo(() => {
		const flagStopId = flagsValues?.[index]?.stop_id;
		const stopId = data?._id;
		return flagStopId === String(stopId);
	}, [flagsValues, index, data?._id]);

	const flagShortNameMatchesStopName = useMemo(() => {
		const flagShortName = flagsValues?.[index]?.short_name;
		const stopShortName = data?.short_name;
		return flagShortName === stopShortName;
	}, [flagsValues, index, data?.short_name]);

	//
	// D. Handle actions

	const handleDeleteFlagItem = () => {
		const latestValues = form.getValues('flags');
		form.setValue('flags', latestValues?.filter((_, i) => i !== index) ?? [], { shouldDirty: true });
	};

	//
	// E. Render components

	return (
		<Surface variant="bordered">
			<Section gap="md">

				<StandardFormController
					control={form.control}
					name={`flags.${index}.agency_ids`}
					render={({ field, fieldState }) => (
						<MultiSelect
							data={agenciesOptions}
							disabled={field.disabled || flagIsHarmonized}
							error={fieldState.error?.message}
							label={t('default:stops.detail.SectionFlagItem.fields.agency_ids.label')}
							onChange={values => field.onChange(values)}
							value={field.value ?? []}
							w="100%"
						/>
					)}
				/>

				<Grid columns="abb" gap="md">
					<StandardFormController
						control={form.control}
						name={`flags.${index}.stop_id`}
						render={({ field, fieldState }) => (
							<TextInput
								disabled={field.disabled || flagIsHarmonized}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionFlagItem.fields.stop_id.label')}
								leftSection={flagIdMatchesStopId ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
								onChange={event => field.onChange(event.target.value)}
								placeholder={t('default:stops.detail.SectionFlagItem.fields.stop_id.placeholder')}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name={`flags.${index}.short_name`}
						render={({ field, fieldState }) => (
							<TextInput
								disabled={field.disabled || flagIsHarmonized}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionFlagItem.fields.short_name.label')}
								leftSection={flagShortNameMatchesStopName ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
								onChange={event => field.onChange(event.target.value)}
								placeholder={t('default:stops.detail.SectionFlagItem.fields.short_name.placeholder')}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
				</Grid>

				<Section alignItems="center" flexDirection="row" gap="md" padding="none">
					<StandardFormController
						control={form.control}
						name={`flags.${index}.is_harmonized`}
						render={({ field, fieldState }) => (
							<Checkbox
								checked={field.value ?? false}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionFlagItem.fields.is_harmonized.label')}
								onChange={event => field.onChange(event.target.checked)}
							/>
						)}
					/>
					<DeleteButton onDelete={handleDeleteFlagItem} />
				</Section>

			</Section>
		</Surface>
	);
}
