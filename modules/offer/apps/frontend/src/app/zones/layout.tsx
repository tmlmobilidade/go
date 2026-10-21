/* * */

import { ZonesLayout } from '@/components/zones/ZonesLayout';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return <ZonesLayout>{children}</ZonesLayout>;
}
