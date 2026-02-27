/* * */

// NOTE: This is an approximate snapshot of GO v1 "Zone" documents.
// It exists only to provide a stable TypeScript shape for the seeding helpers.

const originalZone = {
	__v: 0,
	_id: '64996dcddef15d4f55c95831',
	border_color: '#0b02fa',
	border_opacity: 0.5,
	border_width: 3,
	code: '1109',
	createdAt: '2024-03-13T11:39:00.842Z',
	fill_color: '#0b02fa',
	fill_opacity: 0.2,
	geojson: {
		geometry: {
			coordinates: [
				[-9.38702172023055, 39.0624198488869],
				[-9.38702502160775, 39.0624243214926],
				[-9.38706939779291, 39.0624836521377],
			],
			type: 'Polygon',
		},
		type: 'Feature',
	},
	is_locked: false,
	name: 'Mafra',
	updatedAt: '2024-03-13T11:39:00.842Z',
};

/* * */

export type OriginalZoneType = typeof originalZone;
