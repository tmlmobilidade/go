/* * */

import { AreasHomeGroup } from '@/components/layout/AreasHomeGroup';
import { AGENCIES } from '@/constants';

/* * */

export default async function Page() {
	return <AreasHomeGroup agencies={[AGENCIES.AREA_3, AGENCIES.AREA_4]} />;
}
