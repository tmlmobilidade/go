'use client';

import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { StandardFormController, TextInput } from '@tmlmobilidade/ui';

import { type UseSchoolCreateFormReturnType } from '../../use-schools-create-form';

/* * */

export type SchoolCreateTextFieldName = {
	[Key in keyof CreateSchoolDto]: CreateSchoolDto[Key] extends string ? Key : never
}[keyof CreateSchoolDto];

interface SchoolCreateTextFieldProps {
	form: UseSchoolCreateFormReturnType['form']
	label: string
	name: SchoolCreateTextFieldName
}

/* * */

export function SchoolCreateTextField({ form, label, name }: SchoolCreateTextFieldProps) {
	//

	//
	// A. Render components

	return (
		<StandardFormController
			control={form.control}
			name={name}
			render={({ field, fieldState }) => (
				<TextInput
					error={fieldState.error?.message}
					label={label}
					onBlur={field.onBlur}
					onChange={event => field.onChange(event.currentTarget.value)}
					value={field.value ?? ''}
					withAsterisk={CreateSchoolSchema.shape[name].isOptional() === false}
				/>
			)}
		/>
	);
}
