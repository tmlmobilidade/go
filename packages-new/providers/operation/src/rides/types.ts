/* * */

import { type Ride, RideIdentitySchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/**
 * The type of the filter keys for the rides.
 * @example
 * ```ts
 * type RideFilterKey = 'driver_id' | 'vehicle_id' | 'date';
 * ```
 */
export type RideFilterKey = {
	[P in keyof Ride]: Ride[P] extends number | string ? P : never;
}[keyof Ride];

/**
 * The type of the filter fields for the rides.
 * @example
 * ```ts
 * const filter: RideFilterFields = {
 * 	driver_id: '123',
 * 	vehicle_id: '456',
 * 	date: new Date(),
 * };
 * ```
 */
export type RideFilterFields<K extends RideFilterKey = RideFilterKey> = {
	[P in K]: Ride[P] | Ride[P][];
};

/**
 * Represents the atomic updateable fields for a ride, which are all fields except
 * the ones that identify the ride uniquely, and the `updated_at` timestamp.
 */
export type RideAtomicUpdateFields = Partial<Omit<Ride, 'updated_at' | keyof z.infer<typeof RideIdentitySchema>>>;
