'use client';

/* * */

import { redirect, RedirectType } from 'next/navigation';

/* * */

export default function Page() {
	redirect('/catalog', RedirectType.replace);
}
