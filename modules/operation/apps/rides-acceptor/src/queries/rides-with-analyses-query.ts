/* * */

import { REQUIRED_ANALYSES } from '../types/ride-with-analyses.js';
import { buildRidesWithAnalysesQuery } from './build-rides-with-analyses-query.js';

/* * */

export const ridesWithAnalysesQuery = buildRidesWithAnalysesQuery(REQUIRED_ANALYSES);
