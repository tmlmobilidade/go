/* * */

import { cookies as nextCookies } from 'next/headers';

/* * */

export default async function Page() {
	const cookies = await nextCookies();
	return <div>hello: {cookies.get('session_token')?.value}</div>;
}
