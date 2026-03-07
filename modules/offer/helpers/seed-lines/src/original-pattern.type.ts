/* * */

// NOTE: This is an approximate snapshot of GO v1 "Pattern" documents.
// It exists only to provide a stable TypeScript shape for the seeding helpers.

const originalPattern = {
	_id: '64a35a213fdf2a22e9bdf869',
	code: '1001_0_1',
	headsign: 'Reboleira (Estação)',
	parent_route: '64a358f63fdf2a22e9bdeb24',
};

/* * */

export type OriginalPatternType = typeof originalPattern;
export type OriginalPatternDetailType = typeof originalPatternDetail;

const originalPatternDetail = {
	__v: 0,
	_id: '64a35a213fdf2a22e9bdf869',
	code: '1001_0_1',
	createdAt: '2025-10-13T14:40:23.643Z',
	destination: 'Reboleira (Estação)',
	direction: '0',
	headsign: 'Reboleira (Estação)',
	is_locked: false,
	origin: 'Alfragide (Hosp Veterinário)',
	parent_line: '64a358f03fdf2a22e9bddc8c',
	parent_route: '64a358f63fdf2a22e9bdeb24',
	path: [
		{
			_id: '68ed0f57985b8c46924bcf7a',
			allow_drop_off: true,
			allow_pickup: true,
			default_dwell_time: 30,
			default_travel_time: 0,
			default_velocity: 0,
			distance_delta: 0,
			stop: '6476b0c8424adb51586ecfbe',
			timepoint: true,
			zones: [
				'64996da1def15d4f55c95805',
				'64911309b0c69c6cc5eac7dc',
			],
		},
		{
			_id: '68ed0f57985b8c46924bcf7b',
			allow_drop_off: true,
			allow_pickup: true,
			default_dwell_time: 30,
			default_travel_time: 60,
			default_velocity: 14,
			distance_delta: 242,
			stop: '6476b0c8424adb51586ed06f',
			timepoint: false,
			zones: [
				'64996da1def15d4f55c95805',
				'64911309b0c69c6cc5eac7dc',
			],
		},
	],
	presets: {
		dwell_time: 30,
		velocity: 21,
	},
	schedules: [
		{
			_id: '667c18cf6d862653c1564e3e',
			calendar_desc: '',
			calendars_off: [
				'652d51b621e57b6350934f2d',
				'654d0d95e99b65869fafb380',
			],
			calendars_on: [
				'651ff6715d5cb4592c2ab10a',
				'651ffc3d5d5cb4592c2abbe6',
				'651ffac75d5cb4592c2ab92b',
			],
			path_overrides: [],
			start_time: '06:20',
			vehicle_features: {
				allow_bicycles: true,
				passenger_counting: true,
				propulsion: '0',
				type: '0',
				video_surveillance: true,
			},
		},
	],
	shape: {
		extension: 6586,
		geojson: {
			geometry: {
				coordinates: [
					[-9.220572, 38.734436],
					[-9.22051, 38.73444],
				],
				type: 'LineString',
			},
			type: 'Feature',
		},
		points: '<IGNORE>',
	},
	updatedAt: '2025-10-13T14:40:23.643Z',
};
