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

	if (!data) {
		return (
			<div className={styles.appLogo}>
				<WhenMode
					dark={(
						<Image
							key={data?.logo_dark}
							alt="Logo"
							src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/layout/sidebar/go-sidebar-fallback-dark.png`}
							width={70}
						/>
					)}
					light={(
						<Image
							key={data?.logo_light}
							alt="Logo"
							src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/layout/sidebar/go-sidebar-fallback-light.png`}
							width={70}
						/>
					)}
				/>
			</div>
		);
	}

	return (
		<div className={styles.appLogo}>
			<WhenMode
				dark={(
					<Image
						key={data?.logo_dark}
						alt="Logo"
						fallbackSrc={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/layout/sidebar/go-sidebar-fallback-dark.png`}
						src={data?.logo_dark}
						width={70}
					/>
				)}
				light={(
					<Image
						key={data?.logo_light}
						alt="Logo"
						fallbackSrc={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/layout/sidebar/go-sidebar-fallback-light.png`}
						src={data?.logo_light}
						width={70}
					/>
				)}
			/>
		</div>
	);
}
