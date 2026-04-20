/* * */

import { AlertsPublicDataProviders } from '@/features/alerts-public/providers/DataProviders';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return <AlertsPublicDataProviders>{children}</AlertsPublicDataProviders>;
}
