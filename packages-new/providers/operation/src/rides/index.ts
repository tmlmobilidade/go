/* * */

import { findHashedTripById } from './find-hashed-trip-by-id.js';
import { findHashedTripByRideId } from './find-hashed-trip-by-ride-id.js';
import { findRideById } from './find-ride-by-id.js';
import { findRides } from './find-rides.js';
import { updateRideById } from './update-ride-by-id.js';
import { updateRides } from './update-rides.js';

/* * */

export const ridesProvider = {
	findHashedTripById,
	findHashedTripByRideId,
	findRideById,
	findRides,
	updateRideById,
	updateRides,
};
