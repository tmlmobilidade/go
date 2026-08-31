import { type Location } from '@tmlmobilidade/go-types-locations';

/* * */

export type LocationEntity = NonNullable<Location['district']>;

export type LocationEntityWithProperties = LocationEntity & {
	properties?: {
		name?: string
	}
};

