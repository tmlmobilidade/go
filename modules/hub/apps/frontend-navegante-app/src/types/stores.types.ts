/* * */

import { Store } from '@carrismetropolitana/navegante-tempo-real-shared-types';

/* * */

export interface StoreGroupByMunicipality {
	municipality_id: string
	municipality_name: string
	stores: Store[]
}
