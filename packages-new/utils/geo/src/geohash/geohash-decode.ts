/* * */

import geohash from 'ngeohash';

/* * */

export const geohashDecode = (...args: Parameters<typeof geohash.decode>) => geohash.decode(...args);
