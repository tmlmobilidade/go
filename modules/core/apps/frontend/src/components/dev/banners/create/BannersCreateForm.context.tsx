'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateOperationalBannerDto, CreateOperationalBannerSchema, type OperationalBanner } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useBannersListData } from '../list/use-banners-list-data';
import { closeBannersCreateModal } from './BannersCreate.modal';

/* * */

const BannersCreateFormContext = createContext<StandardFormContextValue<CreateOperationalBannerDto> | undefined>(undefined);

/* * */

export function useBannersCreateFormContext() {
	//

	const value = useContext(BannersCreateFormContext);
	if (!value) throw new Error('useBannersCreateFormContext must be used within its provider');

	return value;
}

/* * */

export function BannersCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me } = useMeData();
	const { mutate } = useBannersListData();
	const catalog = PermissionCatalog.all.banners;
	const canCreate = PermissionCatalog.hasPermission(me?.permissions ?? [], catalog.scope, catalog.actions.update);

	//
	// B. Set up the draft form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateOperationalBannerDto, typeof CreateOperationalBannerSchema>({
		defaultValues: {
			dismissible: false,
			ends_at: null,
			kind: 'maintenance',
			link: null,
			message: '',
			scope: { type: 'platform' },
			severity: 'info',
			starts_at: null,
			title: '',
		},
		schema: CreateOperationalBannerSchema,
	});

	//
	// C. Create and open the new draft

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: () =>
			fetchApiData<OperationalBanner>({
				body: CreateOperationalBannerSchema.parse(form.getValues()),
				method: 'POST',
				url: API_ROUTES.core.OPERATIONAL_BANNERS_LIST,
			}),
		onSuccess: (response) => {
			if (!response.data) return;
			form.reset();
			unblock();
			closeBannersCreateModal();
			mutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.DEV_BANNERS_DETAIL(response.data._id)));
		},
	});
	const capabilities = useStandardFormCapabilities({ create: { hasPermission: canCreate, isCreating: isCreating }, form: { isDirty, isValid } });

	//
	// D. Expose form state

	const value = useMemo(
		() => ({
			actions: { create: () => form.handleSubmit(() => handleCreate())() },
			capabilities,
			form,
			isDirty,
			isValid,
			status: { isCreating: isCreating },
			unblock,
		}),
		[capabilities, handleCreate, isCreating, form, isDirty, isValid, unblock],
	);

	return <BannersCreateFormContext.Provider value={value}>{children}</BannersCreateFormContext.Provider>;
}
