/* * */

import { apexT11, apexT19, hashedShapes, hashedTrips, rides, vehicleEvents } from '@tmlmobilidade/core/interfaces';

/* * */

(async function init() {
	//

	const apexT11Collection = await apexT11.getCollection();
	const apexT19Collection = await apexT19.getCollection();
	const ridesCollection = await rides.getCollection();
	const vehicleEventsCollection = await vehicleEvents.getCollection();
	const hashedShapesCollection = await hashedShapes.getCollection();
	const hashedTripsCollection = await hashedTrips.getCollection();

	// Delete all collections in parallel
	await Promise.all([
		(async () => {
			console.log('will delete hashedShapesCollection');
			await hashedShapesCollection.deleteMany({});
			console.log('hashedShapesCollection deleted');
		})(),
		(async () => {
			console.log('will delete hashedTripsCollection');
			await hashedTripsCollection.deleteMany({});
			console.log('hashedTripsCollection deleted');
		})(),
		(async () => {
			console.log('will delete ridesCollection');
			await ridesCollection.deleteMany({});
			console.log('ridesCollection deleted');
		})(),
		(async () => {
			console.log('will delete apexT11Collection');
			await apexT11Collection.deleteMany({});
			console.log('apexT11Collection deleted');
		})(),
		(async () => {
			console.log('will delete apexT19Collection');
			await apexT19Collection.deleteMany({});
			console.log('apexT19Collection deleted');
		})(),
		(async () => {
			console.log('will delete vehicleEventsCollection');
			await vehicleEventsCollection.deleteMany({});
			console.log('vehicleEventsCollection deleted');
		})(),
	]);

	//
})();
