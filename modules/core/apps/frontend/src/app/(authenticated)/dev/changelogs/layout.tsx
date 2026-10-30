/* * */

import { ChangelogLayout } from '@/components/dev/changelogs/ChangelogLayout';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return <ChangelogLayout>{children}</ChangelogLayout>;
}
