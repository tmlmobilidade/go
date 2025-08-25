'use client';

/* * */

import { CreateStopStep1Map } from '@/components/stops/create/CreateStopStep1Map';
import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, CoordinatesInput, Divider, Section } from '@tmlmobilidade/ui';

/* * */

export function CreateStopStep1() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Handle actions

	const handleSelectInMap = (value: [number, number]) => {
		stopCreateContext.data.form.setFieldValue('latitude', value[0]);
		stopCreateContext.data.form.setFieldValue('longitude', value[1]);
	};

	//
	// C. Render components

	return (
		<>

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<CreateStopStep1Map />

			<Divider />

			<Section gap="md">
				<CoordinatesInput
					onChange={handleSelectInMap}
					value={[stopCreateContext.data.form.values.latitude, stopCreateContext.data.form.values.longitude]}
				/>
			</Section>

		</>
	);

	//
}
