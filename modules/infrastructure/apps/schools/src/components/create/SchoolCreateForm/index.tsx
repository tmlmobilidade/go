'use client';

import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

import { useSchoolCreateFormContext } from '../SchoolCreateForm.context';

/* * */

const schoolTextFields = [
	'address',
	'agency_id',
	'district_id',
	'district_name',
	'email',
	'grouping',
	'locality',
	'municipality_id',
	'municipality_name',
	'name',
	'nature',
	'parish_name',
	'postal_code',
	'region_id',
	'region_name',
] as const satisfies readonly (keyof CreateSchoolDto)[];

/* * */

export function SchoolCreateForm() {
	//

	//
	// A. Setup variables

	const { form } = useSchoolCreateFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="xl">
				{schoolTextFields.map(name => (
					<StandardFormController
						key={name}
						control={form.control}
						name={name}
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={name.replaceAll('_', ' ')}
								onBlur={field.onBlur}
								onChange={event => field.onChange(event.currentTarget.value)}
								value={field.value ?? ''}
								withAsterisk={CreateSchoolSchema.shape[name].isOptional() === false}
							/>
						)}
					/>
				))}
			</Grid>
		</Section>
	);
}
