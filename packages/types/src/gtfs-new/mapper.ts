/* * */

type ValueMapper<Our extends number | string, Gtfs extends number | string> = Record<Our, Gtfs>;

/* * */

export function createGtfsMapper<
	Our extends number | string,
	Gtfs extends number | string,
>(map: ValueMapper<Our, Gtfs>) {
	const forward = map;

	const reverse = Object.entries(map).reduce((acc, [key, value]) => {
		acc[value as Gtfs] = key as Our;
		return acc;
	}, {} as Record<Gtfs, Our>);

	return {
		fromGtfs: (value: Gtfs): Our => {
			const mapped = reverse[value];
			if (mapped === undefined) throw new Error(`No GTFS→Our mapping for: ${value}`);
			return mapped;
		},
		toGtfs: (value: Our): Gtfs => {
			const mapped = forward[value];
			if (mapped === undefined) throw new Error(`No Our→GTFS mapping for: ${value}`);
			return mapped;
		},
	};
}
