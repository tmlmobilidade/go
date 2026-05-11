'use client';

import { Image } from '@mantine/core';
import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import useSWR from 'swr';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { WhenMode } from '../../layout/WhenMode';

/* * */

export function AppWrapperLogo() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: organizationLogoData } = useSWR<{ logo_dark: null | string, logo_light: null | string }, HttpException>(meContext.data.user?.organization_id && API_ROUTES.auth.ORGANIZATIONS_DETAIL_LOGO(meContext.data.user.organization_id));

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
