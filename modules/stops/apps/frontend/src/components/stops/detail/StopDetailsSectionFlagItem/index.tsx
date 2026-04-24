'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { IconEqual, IconEqualNot } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Checkbox, DeleteButton, Grid, MultiSelect, Section, Surface, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface StopDetailsSectionFlagItemProps {
	index: number
}

/* * */

export function StopDetailsSectionFlagItem({ index }: StopDetailsSectionFlagItemProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const { options: agenciesOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Transform data

	const flagIsHarmonized = useMemo(() => {
		return stopDetailContext.data.form.getValues().flags?.[index]?.is_harmonized;
	}, [stopDetailContext.data.form, index]);

	const flagIdMatchesStopId = useMemo(() => {
		const flagStopId = stopDetailContext.data.form.getValues().flags?.[index]?.stop_id;
		const stopId = stopDetailContext.data.stop?._id;
		return flagStopId === String(stopId);
	}, [stopDetailContext.data.form, index, stopDetailContext.data.stop]);

	const flagShortNameMatchesStopName = useMemo(() => {
		const flagShortName = stopDetailContext.data.form.getValues().flags?.[index]?.short_name;
		const stopShortName = stopDetailContext.data.stop?.short_name;
		return flagShortName === stopShortName;
	}, [stopDetailContext.data.form, index, stopDetailContext.data.stop]);

	//
	// C. Handle actions

	const handleDeleteFlagItem = () => {
		stopDetailContext.data.form.removeListItem('flags', index);
	};

	//
	// D. Render components

	return (
		<Surface variant="bordered">
			<Section gap="md">
				<MultiSelect
					data={agenciesOptions}
					label="Operadores"
					{...stopDetailContext.data.form.getInputProps(`flags.${index}.agency_ids`)}
					w="100%"
				/>
				<Grid columns="abb" gap="md">
					<TextInput
						label="ID Atual do Operador"
						leftSection={flagIdMatchesStopId ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
						placeholder="ID Atual do Operador"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.stop_id`)}
						disabled={flagIsHarmonized}
						w="100%"
					/>
					<TextInput
						label="Nome Atual do Operador"
						leftSection={flagShortNameMatchesStopName ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
						placeholder="Nome Atual do Operador"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.short_name`)}
						disabled={flagIsHarmonized}
						w="100%"
					/>
				</Grid>
				<Section alignItems="center" flexDirection="row" gap="md" padding="none">
					<Checkbox
						label="Postalete alinhado com os identificadores únicos"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.is_harmonized`, { type: 'checkbox' })}
					/>
					<DeleteButton onDelete={handleDeleteFlagItem} />
				</Section>
			</Section>
		</Surface>
	);

	//
}
