/* * */

import { TypologiesLayout } from '@/components/typologies/TypologiesLayout';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return <TypologiesLayout>{children}</TypologiesLayout>;
}
