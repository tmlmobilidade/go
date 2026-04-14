'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { IconCheck, IconEqualNot } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { DeleteButton, Grid, MultiSelect, Section, Surface, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface StopDetailsSectionFlagItemProps {
	agencyIds: string[]
	index: number
	shortName: string
	stopId: string
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

	const flagIdMatchesStopId = useMemo(() => {
		const flagStopId = stopDetailContext.data.form.getValues().flags?.[index]?.stop_id;
		const stopId = stopDetailContext.data.stop?._id;
		return flagStopId === stopId;
	}, [stopDetailContext.data.form, index, stopDetailContext.data.stop]);

	const flagShortNameMatchesStopName = useMemo(() => {
		const flagShortName = stopDetailContext.data.form.getValues().flags?.[index]?.short_name;
		const stopShortName = stopDetailContext.data.stop?.short_name;
		return flagShortName === stopShortName;
	}, [stopDetailContext.data.form, index, stopDetailContext.data.stop]);

	//
	// C. Handle actions

	const handleDeleteFlagItem = (index: number) => {
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
						label="ID Atual no Postalete"
						leftSection={flagIdMatchesStopId ? <IconCheck color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
						placeholder="ID Atual no Postalete"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.stop_id`)}
						w="100%"
					/>
					<TextInput
						label="Nome Atual no Postalete"
						leftSection={flagShortNameMatchesStopName ? <IconCheck color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
						placeholder="Nome Atual no Postalete"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.short_name`)}
						w="100%"
					/>
				</Grid>
				<DeleteButton onDelete={() => handleDeleteFlagItem(index)} />
			</Section>
		</Surface>
	);

	//
}
