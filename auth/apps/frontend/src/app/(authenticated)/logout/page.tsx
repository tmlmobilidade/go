/* * */

import { getAppConfig } from '@tmlmobilidade/lib';
import { cookies as nextCookies } from 'next/headers';

/* * */

export default async function Page() {
	const cookies = await nextCookies();

	const url = `${getAppConfig('auth', 'api_url')}/logout`;
	const response = await fetch(url, {
		credentials: 'include',
		headers: {
			Cookie: cookies.toString(),
		},
		method: 'POST',
	});

	const responseText = await response.text();
	console.log('Response ():', url);
	console.log('Response text:', responseText);

	return (
		<div>
			URL: {url}
			<br />
			Status: {response.status}
			<br />
			Response: {responseText}
			<br />
			Cookies: {JSON.stringify(cookies.get('session_token'))}
		</div>
	);

	// redirect('/login');
}
