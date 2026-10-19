'use client';

import { Image } from '@mantine/core';

import styles from './styles.module.css';

import { Loader } from '../../../loaders';
import { WhenMode } from '../../layout';
import { useSidebarHeaderLogo } from './use-sidebar-header-logo';

/* * */

export function SidebarHeaderLogo() {
	//

	//
	// A. Setup variables

	const { data, isLoading } = useSidebarHeaderLogo();

	//
	// B. Render components

	if (isLoading) {
		return (
			<div className={styles.appLogo}>
				<Loader size="sm" />
			</div>
		);
	}

	return (
		<div className={styles.appLogo}>
			<WhenMode
				dark={(
					<Image
						alt="Logo"
						fallbackSrc={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/layout/sidebar/go-sidebar-fallback-dark.png`}
						src={data}
						width={70}
					/>
				)}
				light={(
					<Image
						alt="Logo"
						fallbackSrc={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/layout/sidebar/go-sidebar-fallback-light.png`}
						src={data}
						width={70}
					/>
				)}
			/>
		</div>
	);
}
