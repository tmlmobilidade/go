'use client';

import { closeCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { useLinesListData } from '@/components/lines/list/use-lines-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type CreateLineDto, CreateLineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

/* * */

const LineCreateContext = createContext<StandardFormContextValue<CreateLineDto> | undefined>(undefined);

export function useLineCreateContext() {
	const context = useContext(LineCreateContext);
	if (!context) throw new Error('useLineCreateContext must be used within a LineCreateContextProvider');
	return context;
}

/* * */

export function LineCreateContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const accessRef = useRef(false);
	const { mutate: listMutate } = useLinesListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateLineDto, typeof CreateLineSchema>({
		defaultValues: { agency_id: '', code: '', name: '' },
		schema: CreateLineSchema,
	});
	const values = useStandardFormWatch({ control: form.control });

	//
	// C. Handle requests

	const { action: createRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<PopulatedLine>({ body: CreateLineSchema.parse(form.getValues()), method: 'POST', url: API_ROUTES.offer.LINES_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateLineModal();
			if (data?._id) router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_DETAIL(data._id)));
		},
	});

	//
	// D. Setup capabilities

	const agencyIds = values.agency_id ? [values.agency_id] : [];
	const hasCreatePermission = agencyIds.length > 0 && PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.lines.actions.create,
		permissions: me?.permissions ?? [],
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: agencyIds,
	});
	const isReady = !meLoading && !meError;
	const standardCapabilities = useStandardFormCapabilities({
		create: { hasPermission: hasCreatePermission, isCreating },
		form: { isDirty, isValid },
		loading: { isLoading: !isReady },
	});
	const createEnabled = standardCapabilities.createEnabled;
	const editEnabled = standardCapabilities.editEnabled && PermissionCatalog.hasPermission(me?.permissions ?? [], PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);
	accessRef.current = createEnabled;

	const handleCreate = useCallback(async () => {
		if (!accessRef.current) return;
		await form.handleSubmit(async () => {
			if (accessRef.current) await createRequest();
		})();
	}, [createRequest, form]);

	useEffect(() => {
		accessRef.current = createEnabled;
		return () => {
			accessRef.current = false;
		};
	}, [createEnabled]);

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<CreateLineDto> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, isDirty, isValid, unblock]);

	return (
		<LineCreateContext.Provider value={stateValue}>
			{children}
		</LineCreateContext.Provider>
	);
}
