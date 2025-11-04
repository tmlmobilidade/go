import { locations } from '@tmlmobilidade/go-interfaces';

const lng = -9.1205183;
const lat = 38.7173029;

locations.findLocationByGeo(lat, lng, { census: true })
	.then(console.log)
	.catch(console.error)
	.finally(() => {
		process.exit(0);
	});
