const EMISSION_MAP = {
	1: 'EURO_I',
	2: 'EURO_II',
	3: 'EURO_III',
	4: 'EURO_IV',
	5: 'EURO_V',
	6: 'EURO_VI',
} as const;

const PROPULSION_MAP = {
	1: 'gasoline',
	2: 'diesel',
	3: 'lpg_auto',
	4: 'mixture',
	5: 'biodiesel',
	6: 'electricity',
	7: 'hybrid',
	8: 'natural_gas',
} as const;

const TYPOLOGY_MAP = {
	1: 'tram',
	2: 'bus',
	3: 'ship',
	4: 'funicular',
	5: 'metro',
	6: 'train',
} as const;

export { EMISSION_MAP, PROPULSION_MAP, TYPOLOGY_MAP };
