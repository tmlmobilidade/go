/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { redirect } from 'next/navigation';

/* * */

export default function Page() {
	redirect(PAGE_ROUTES.infrastructure.STOPS_LIST);
}
