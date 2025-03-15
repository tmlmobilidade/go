'use client';

/* * */

import { redirect, RedirectType } from 'next/navigation';

/* * */

export default function Page() {
	redirect('/list', RedirectType.replace);
}
