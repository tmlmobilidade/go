'use client';

/* * */

import { WhenMode } from '@/components/layout';
import { useMeContext } from '@/contexts/Me.context';
import { Image } from '@mantine/core';
import { getAppConfig, HttpException } from '@tmlmobilidade/consts';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function AppWrapperLogo() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: organizationLogoData } = useSWR<{ logo_dark: null | string, logo_light: null | string }, HttpException>(meContext.data.user?.organization_id && `${getAppConfig('auth', 'api_url')}/organizations/${meContext.data.user.organization_id}/logo`);

	//
	// C. Render components

	return (
		<div className={styles.appLogo}>
			{organizationLogoData && (
				<WhenMode
					dark={<Image key={organizationLogoData?.logo_dark} alt="Logo" fallbackSrc="" height={50} src={organizationLogoData?.logo_dark} width={70} />}
					light={<Image key={organizationLogoData?.logo_light} alt="Logo" fallbackSrc="" height={50} src={organizationLogoData?.logo_light} width={70} />}
				/>
			)}
		</div>
	);

	//
}
