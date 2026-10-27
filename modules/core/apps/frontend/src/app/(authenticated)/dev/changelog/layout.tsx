/* * */

import { ChangelogLayout } from '@/components/dev/changelog/ChangelogLayout';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return <ChangelogLayout>{children}</ChangelogLayout>;
}
