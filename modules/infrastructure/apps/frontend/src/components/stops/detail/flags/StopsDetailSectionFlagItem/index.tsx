'use client';

import { useStopsAgenciesData } from '@/components/stops/shared/use-stops-agencies-data';
import { IconEqual, IconEqualNot } from '@tabler/icons-react';
import { Checkbox, DeleteButton, Grid, MultiSelect, Section, StandardFormController, Surface, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

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

	const { form } = useStopsDetailFormContext();
	const { data } = useStopsDetailData();

	const flagsValues = useStandardFormWatch({ control: form.control, name: 'flags' });

	//
	// B. Transform data

	const { options: agenciesOptions } = useStopsAgenciesData({
		permissions: { actions: ['read', 'update'], scope: 'stops' },
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
	// C. Handle actions

	const handleDeleteFlagItem = () => {
		const latestValues = form.getValues('flags');
		form.setValue('flags', latestValues?.filter((_, i) => i !== index) ?? []);
	};

	//
	// D. Render components

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
							label="Operadores"
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
								label="ID Atual do Operador"
								leftSection={flagIdMatchesStopId ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
								onChange={event => field.onChange(event.target.value)}
								placeholder="ID Atual do Operador"
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
								label="Nome Atual do Operador"
								leftSection={flagShortNameMatchesStopName ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
								onChange={event => field.onChange(event.target.value)}
								placeholder="Nome Atual do Operador"
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
								label="Postalete alinhado com os identificadores únicos"
								onChange={event => field.onChange(event.target.checked)}
							/>
						)}
					/>
					<DeleteButton onDelete={handleDeleteFlagItem} />
				</Section>

			</Section>
		</Surface>
	);

	//
}
