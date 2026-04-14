'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { DeleteButton, Grid, MultiSelect, Section, Surface, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

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
						label="Nome Atual no Postalete"
						placeholder="Nome Atual no Postalete"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.short_name`)}
						w="100%"
					/>
					<TextInput
						label="ID Atual no Postalete"
						placeholder="ID Atual no Postalete"
						{...stopDetailContext.data.form.getInputProps(`flags.${index}.stop_id`)}
						w="100%"
					/>
				</Grid>
				<DeleteButton onDelete={() => handleDeleteFlagItem(index)} />
			</Section>
		</Surface>
	);

	//
}
