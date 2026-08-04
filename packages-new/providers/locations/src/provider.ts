/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class LocationsProviderClass {
	private static _instance: LocationsProviderClass;

	private constructor() {}

	public static async getInstance() {
		if (!LocationsProviderClass._instance) {
			LocationsProviderClass._instance = new LocationsProviderClass();
		}
		return LocationsProviderClass._instance;
	}

	async findDistrictByGeo(lat: number, lon: number): Promise<District | null> {
		const district = await goDb.locations.districts.findOne(this.geoFilter(lat, lon));
		if (!district) return null;
		return { _id: district._id, ...district.properties };
	}

	async findDistrictById(id: string): Promise<District | null> {
		const district = await goDb.locations.districts.findOne({ _id: id });
		if (!district) return null;
		return { _id: district._id, ...district.properties };
	}

	async findLocalityByGeo(lat: number, lon: number): Promise<Locality | null> {
		const locality = await goDb.locations.localities.findOne(this.geoFilter(lat, lon));
		if (!locality) return null;
		return { _id: locality._id, ...locality.properties };
	}

	async findLocalityById(id: string): Promise<Locality | null> {
		const locality = await goDb.locations.localities.findOne({ _id: id });
		if (!locality) return null;
		return { _id: locality._id, ...locality.properties };
	}

	async findMunicipalityByGeo(lat: number, lon: number): Promise<Municipality | null> {
		const municipality = await goDb.locations.municipalities.findOne(this.geoFilter(lat, lon));
		if (!municipality) return null;
		return { _id: municipality._id, ...municipality.properties };
	}

	async findMunicipalityById(id: string): Promise<Municipality | null> {
		const municipality = await goDb.locations.municipalities.findOne({ _id: id });
		if (!municipality) return null;
		return { _id: municipality._id, ...municipality.properties };
	}

	async findParishByGeo(lat: number, lon: number): Promise<null | Parish> {
		const parish = await goDb.locations.parishes.findOne(this.geoFilter(lat, lon));
		if (!parish) return null;
		return { _id: parish._id, ...parish.properties };
	}

	async findParishById(id: string): Promise<null | Parish> {
		const parish = await goDb.locations.parishes.findOne({ _id: id });
		if (!parish) return null;
		return { _id: parish._id, ...parish.properties };
	}

	// Find Location by Geo
	async findLocationByGeo(lat: number, lon: number) {
		if (!lat || !lon) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing latitude or longitude');

		const [district, locality, municipality, parish] = await Promise.all([
			this.findDistrictByGeo(lat, lon),
			this.findLocalityByGeo(lat, lon),
			this.findMunicipalityByGeo(lat, lon),
			this.findParishByGeo(lat, lon),
		]);

		return {
			district,
			latitude: lat,
			locality,
			longitude: lon,
			municipality,
			parish,
		};
	}

	/*  Private */

	private geoFilter(lat: number, lon: number) {
		return { geometry: { $geoIntersects: { $geometry: { coordinates: [lon, lat], type: 'Point' } } } };
	}
}

/* * */

export const locationsProvider = asyncSingletonProxy(LocationsProviderClass);
