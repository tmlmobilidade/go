'use client';

import { useLocationsContext } from '@/contexts/Locations.context';
import { Badge, Description, Label, Section } from '@tmlmobilidade/ui';

/* * */

interface FilterItem {
	id: string
	label: string
}

const FILTER_ITEMS: FilterItem[] = [
	{ id: 'locality', label: 'Localidade' },
	{ id: 'municipality', label: 'Município' },
	{ id: 'parish', label: 'Freguesia' },
	{ id: 'district', label: 'Distrito' },
];

/* * */

export function LocationsFilters() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<div>
				<Label>Filtros</Label>
				<Description>Selecione os filtros que deseja aplicar</Description>
			</div>
			<Section
				alignItems="center"
				flexDirection="row"
				flexWrap="wrap"
				gap="sm"
				justifyContent="space-between"
				padding="none"
			>
				{FILTER_ITEMS.map(filter => (
					<Badge
						key={filter.id}
						onClick={() => locationsContext.actions.toggleFilter(filter.id)}
						size="sm"
						variant={!locationsContext.data.filterOut.includes(filter.id) ? 'primary' : 'muted'}
					>
						{filter.label}
					</Badge>
				))}
			</Section>
		</Section>
	);

	//
}
