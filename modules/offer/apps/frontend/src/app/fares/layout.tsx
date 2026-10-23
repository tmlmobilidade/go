/* * */

import { FaresLayout } from '@/components/fares/FaresLayout';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return <FaresLayout>{children}</FaresLayout>;
}
