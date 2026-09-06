/* * */

import { findRideById } from './find-ride-by-id.js';
import { updateRideById } from './update-ride-by-id.js';
import { updateRides } from './update-rides.js';

/* * */

export const ridesProvider = {
	findRideById,
	updateRideById,
	updateRides,
};
