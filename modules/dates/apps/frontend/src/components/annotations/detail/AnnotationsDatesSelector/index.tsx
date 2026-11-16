'use client';

import { StandardFormController } from '@tmlmobilidade/ui';

import { AnnotationsDatesSelect } from '../../shared/AnnotationsDatesSelect';
import { useAnnotationsDetailFormContext } from '../AnnotationsDetailForm.context';

/* * */

export function AnnotationsDatesSelector() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useAnnotationsDetailFormContext();

	//
	// B. Render components

	return (
		<StandardFormController
			control={form.control}
			name="dates"
			render={({ field, fieldState }) => (
				<AnnotationsDatesSelect error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
			)}
		/>
	);
}
