/* * */

import { getAppConfig } from '@tmlmobilidade/lib';
import { Loader } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';

/* * */

export default async function Page() {
	const cookies = await nextCookies();

	const url = `${getAppConfig('auth', 'api_url')}/logout`;
	await fetch(url, {
		credentials: 'include',
		headers: {
			Cookie: cookies.toString(),
		},
		method: 'POST',
	});

	return <Loader />;
}
