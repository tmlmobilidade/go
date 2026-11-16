/* * */

import { BannersLayout } from '@/components/dev/banners/BannersLayout';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return <BannersLayout>{children}</BannersLayout>;
}
