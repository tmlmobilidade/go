/* * */

import geohash from 'ngeohash';

/* * */

export const geohashEncode = (...args: Parameters<typeof geohash.encode>) => geohash.encode(...args);
