/* * */

import { type Store } from '@/types/api/facilities/stores.type';

/* * */

export interface StoreGroupByMunicipality {
	municipality_id: string
	municipality_name: string
	stores: Store[]
}
