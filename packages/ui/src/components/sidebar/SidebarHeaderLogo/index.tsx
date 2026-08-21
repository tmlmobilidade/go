'use client';

import { Image } from '@mantine/core';
import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { fetchData } from '@tmlmobilidade/utils';
import useSWR from 'swr';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts';
import { Loader } from '../../../loaders';
import { WhenMode } from '../../layout';

/* * */

export function SidebarHeaderLogo() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: organizationLogoData, isLoading: organizationLogoLoading } = useSWR<{ logo_dark: null | string, logo_light: null | string }, HttpException>(
		meContext.data.user?.organization_id ? API_ROUTES.auth.ORGANIZATIONS_DETAIL_LOGO(meContext.data.user.organization_id) : null,
		{
			fetcher: async (url: string) => {
				const response = await fetchData<{ logo_dark: null | string, logo_light: null | string }>(url);
				if (response.error) throw new HttpException(response.statusCode, response.error);
				return response.data ?? { logo_dark: null, logo_light: null };
			},
		},
	);

	const fallbackDark = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/layout/sidebar/go-sidebar-fallback-dark.png`;
	const fallbackLight = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/layout/sidebar/go-sidebar-fallback-light.png`;

	//
	// C. Render components

	return (
		<div className={styles.appLogo}>
			{organizationLogoLoading ? <Loader size="sm" /> : (
				<WhenMode
					dark={<Image key={organizationLogoData?.logo_dark ?? fallbackDark} alt="Logo" fallbackSrc={fallbackDark} src={organizationLogoData?.logo_dark ?? fallbackDark} width={70} />}
					light={<Image key={organizationLogoData?.logo_light ?? fallbackLight} alt="Logo" fallbackSrc={fallbackLight} src={organizationLogoData?.logo_light ?? fallbackLight} width={70} />}
				/>
			)}
		</div>
	);
}
