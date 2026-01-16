export const parseWheelchairAccessibility = (wheelchair?: string, ramp?: string): string => {
	if (wheelchair === '0') return 'no';

	switch (ramp) {
		case '1':
			return 'manual_ramp';
		case '2':
			return 'electric_ramp';
		default:
			throw new Error('Invalid wheelchair accessibility');
	}
};
