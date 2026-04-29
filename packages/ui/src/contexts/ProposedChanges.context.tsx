/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Line } from '@carrismetropolitana/api-types/network';
import { getModuleConfig, HttpException } from '@tmlmobilidade/consts';
import { CreateProposedChangeDto, ProposedChange, Stop, StopFacility, StopFacilitySchema } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { useToast } from '../hooks';

/* * */

export interface ScopeEntityMap {
	line: Line
	stop: Stop
}

/* * */

export type ScopeKey = keyof ScopeEntityMap;
type Entity = ScopeEntityMap[ScopeKey];

/* * */

interface ProposedChangesContextState<T> {
	actions: {
		approve: (id: string, field: string, relatedId: string, value: unknown) => Promise<void>
		reject: (id: string) => Promise<void>
		submit: (data: CreateProposedChangeDto<T>) => Promise<void>
	}
	data: {
		allProposedChanges: ProposedChange<T>[]
		allProposedChangesByRelatedId: ProposedChange<T>[]
	}
	flags: {
		error?: HttpException
		loading: boolean
	}
}

/* * */

const ProposedChangesContext = createContext<ProposedChangesContextState<any> | undefined>(undefined);

export function useProposedChangesContext<S extends ScopeKey>(scope: S): ProposedChangesContextState<ScopeEntityMap[S]> {
	void scope;
	const context = useContext(ProposedChangesContext);
	if (!context) {
		throw new Error('useProposedChangesContext must be used within a ProposedChangesContextProvider');
	}
	return context as ProposedChangesContextState<ScopeEntityMap[S]>;
}

/* * */

export function ProposedChangesContextProvider<S extends ScopeKey>({ children, relatedId, scope }: PropsWithChildren<{ relatedId?: string, scope: S }>) {
	//
	// A. Setup variables

	const entityEndpoints: Record<ScopeKey, string> = { line: 'lines', stop: 'stops' };
	const [relatedProposedChanges, setRelatedProposedChanges] = useState<ProposedChange<Entity>[]>([]);
	const { data: proposedChangesData, error: proposedChangesError, isLoading: proposedChangesLoading } = useSWR<ProposedChange<Entity>[], HttpException>(`${getModuleConfig('auth', 'api_url')}/proposed-changes?scope=${scope}`, { refreshInterval: 2000 });

	//
	// B. Transform data

	useEffect(() => {
		if (!proposedChangesData || proposedChangesError || !relatedId) return;
		const filtered = proposedChangesData.filter(change => change?.related_id === relatedId);
		setRelatedProposedChanges(filtered ?? []);
	}, [proposedChangesData, relatedId, proposedChangesError, proposedChangesLoading]);

	//
	// C. Handle actions

	const approve = async <S extends ScopeKey>(id: string, field: keyof ScopeEntityMap[S] | string, relatedId: string, value: unknown) => {
		const { key, prevData } = getProposedChangesKeyAndData();
		try {
			const entityResponse = await fetchData(`${getModuleConfig(entityEndpoints[scope], 'api_url')}/${entityEndpoints[scope]}/${relatedId}`, 'GET');
			const entity = entityResponse.data as ScopeEntityMap[S];
			const updateBody = getUpdateBodyForScope(entity, field as string, value, scope);
			const updated = prevData.map(change => change?._id === id ? { ...change, status: 'approved' } : change);
			await mutate(key, updated, false);
			await fetchData(`${getModuleConfig(entityEndpoints[scope], 'api_url')}/${entityEndpoints[scope]}/${relatedId}`, 'PUT', updateBody);
			await fetchData(`${getModuleConfig('auth', 'api_url')}/proposed-changes/${id}`, 'PUT', { status: 'approved' });
			useToast.success({ message: 'Proposta aprovada com sucesso', title: 'Sucesso' });
			await mutate(key);
		}
		catch (error) {
			console.error('Error approving proposed change:', error);
			useToast.error({ message: 'Erro ao aprovar proposta', title: 'Erro' });
			await mutate(key);
			await fetchData(`${getModuleConfig('auth', 'api_url')}/proposed-changes/${id}`, 'PUT', { status: 'pending' });
		}
	};

	const reject = async (id: string) => {
		const { key, prevData } = getProposedChangesKeyAndData();
		const updated = prevData.map(change => change?._id === id ? { ...change, status: 'rejected' } : change);
		try {
			await mutate(key, updated, false);
			await fetchData(`${getModuleConfig('auth', 'api_url')}/proposed-changes/${id}`, 'PUT', { status: 'rejected' });
			useToast.success({ message: 'Proposta rejeitada com sucesso', title: 'Sucesso' });
			await mutate(key);
		}
		catch (error) {
			console.error('Error rejecting proposed change:', error);
			useToast.error({ message: 'Erro ao reprovar proposta', title: 'Erro' });
			await mutate(key);
		}
	};

	const submit = async (data: CreateProposedChangeDto<Entity>) => {
		const { key, prevData } = getProposedChangesKeyAndData();
		try {
			const optimistic = [...prevData, { ...data, status: 'pending' }];
			await mutate(key, optimistic, false);
			await fetchData(`${getModuleConfig('auth', 'api_url')}/proposed-changes`, 'POST', data);
			useToast.success({ message: 'Proposta submetida com sucesso', title: 'Sucesso' });
			await mutate(key);
		}
		catch (error) {
			console.error('Error submitting proposed change:', error);
			useToast.error({ message: 'Erro ao submeter proposta', title: 'Erro' });
			await mutate(key);
		}
	};

	const getProposedChangesKeyAndData = () => {
		const key = `${getModuleConfig('auth', 'api_url')}/proposed-changes?scope=${scope}`;
		const prevData = proposedChangesData ?? [];
		return { key, prevData };
	};

	const getUpdateBodyForScope = (entity: Record<string, any>, field: string, value: unknown, scope: ScopeKey) => {
		const normalizedField = String(field).startsWith('near_') ? String(field).replace(/^near_/, '') : String(field);
		const updateBody: Record<string, unknown> = {};

		// Special case: facilities for stops
		if (scope === 'stop' && Array.isArray(entity['facilities']) && (normalizedField === 'facilities' || StopFacilitySchema.options.includes(normalizedField as StopFacility))) {
			const currentArray = entity['facilities'] as StopFacility[];
			const item = normalizedField === 'facilities' ? value as StopFacility : normalizedField as StopFacility;
			const exists = currentArray.includes(item);
			updateBody['facilities'] = exists ? currentArray.filter(f => f !== item) : [...currentArray, item];
			return updateBody;
		}

		if (normalizedField in entity) {
			updateBody[normalizedField] = value;
			return updateBody;
		}

		return updateBody;
	};

	//
	// E. Define context value

	const contextValue: ProposedChangesContextState<Entity> = useMemo(() => ({
		actions: { approve, reject, submit },
		data: {
			allProposedChanges: proposedChangesData ?? [],
			allProposedChangesByRelatedId: relatedProposedChanges ?? [],
		},
		flags: {
			error: proposedChangesError,
			loading: proposedChangesLoading,
		},
	}),
	[proposedChangesData, proposedChangesError, proposedChangesLoading, relatedProposedChanges],
	);

	//
	// F. Render Components

	return <ProposedChangesContext.Provider value={contextValue}>{children}</ProposedChangesContext.Provider>;

	//
}
