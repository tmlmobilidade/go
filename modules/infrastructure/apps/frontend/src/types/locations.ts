import { type Location } from '@tmlmobilidade/types';

/* * */

export type LocationEntity = NonNullable<Location['district']>;

export type LocationEntityWithProperties = LocationEntity & {
	properties?: {
		name?: string
	}
};

