'use client';

/* * */

import { type RidesCatalogClockStatus } from '@/components/catalog/RidesCatalogClockStatus';
import { type RidesCatalogUpdatedAt } from '@/components/catalog/RidesCatalogUpdatedAt';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { Button, Label, SegmentedControl, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RidesCatalogHeader() {
	//

	//
	// A. Setup variables

	const operationalDateContext = useOperationalDateContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Monitorização</Label>
			<Spacer />
			<RidesCatalogUpdatedAt />
			<TextInput />
			<RidesCatalogClockStatus />
			<Button label="‹" onClick={operationalDateContext.actions.updateSelectedDateToLessOneDay} />
			<Button label={operationalDateContext.data.selected_date} onClick={operationalDateContext.actions.updateSelectedDateToToday} />
			<Button label="›" onClick={operationalDateContext.actions.updateSelectedDateToPlusOneDay} />
			<SegmentedControl data={[
				{ label: 'Catálogo', value: 'catalog' },
				{ label: 'Mapa', value: 'map' },
				{ label: 'Espinhas', value: 'spine' },
			]}
			/>
		</>
	);

	//
}
