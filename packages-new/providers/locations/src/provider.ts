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

	/*  Find By Geo */

	async findDistrictByGeo(lat: number, lon: number): Promise<District | null> {
		return goDb.locations.districts.findOne(this.geoFilter(lat, lon) as any);
	}

	async findLocalityByGeo(lat: number, lon: number): Promise<Locality | null> {
		return goDb.locations.localities.findOne(this.geoFilter(lat, lon) as any);
	}

	async findLocationByGeo(lat: number, lon: number) {
		if (!lat || !lon) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing latitude or longitude');

		const [municipality, parish, district, locality] = await Promise.all([
			this.findMunicipalityByGeo(lat, lon),
			this.findParishByGeo(lat, lon),
			this.findDistrictByGeo(lat, lon),
			this.findLocalityByGeo(lat, lon),
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

	async findMunicipalityByGeo(lat: number, lon: number): Promise<Municipality | null> {
		return goDb.locations.municipalities.findOne(this.geoFilter(lat, lon) as any);
	}

	async findParishByGeo(lat: number, lon: number): Promise<null | Parish> {
		return goDb.locations.parishes.findOne(this.geoFilter(lat, lon) as any);
	}

	/*  Private */

	private geoFilter(lat: number, lon: number) {
		return { geometry: { $geoIntersects: { $geometry: { coordinates: [lon, lat], type: 'Point' } } } };
	}
}

/* * */

export const locationsProvider = asyncSingletonProxy(LocationsProviderClass);
