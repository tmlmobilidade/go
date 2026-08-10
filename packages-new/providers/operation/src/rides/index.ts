/* * */

import { findRideById } from './find-ride-by-id.js';
import { findRidesByQuery } from './find-rides-query.js';
import { findRides } from './find-rides.js';
import { updateRideById } from './update-ride-by-id.js';
import { updateRides } from './update-rides.js';

/* * */

export const ridesProvider = {
	findRideById,
	findRides,
	findRidesByQuery,
	updateRideById,
	updateRides,
};
