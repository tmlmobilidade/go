const EMISSION_MAP: Record<string, string> = {
	0: 'N/A',
	1: 'EURO_I',
	2: 'EURO_II',
	3: 'EURO_III',
	4: 'EURO_IV',
	5: 'EURO_V',
	6: 'EURO_VI',
};

const PROPULSION_MAP: Record<string, string> = {
	1: 'gasoline',
	2: 'diesel',
	3: 'lgp_auto',
	4: 'mixture',
	5: 'biodiesel',
	6: 'electricity',
	7: 'hybrid',
	8: 'nature_gas',

};

export { EMISSION_MAP, PROPULSION_MAP };
