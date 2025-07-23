'use client';

import { DataTable, DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

interface ParsedMdxFile {
	_id: string
	html: string
	subtitle?: string
	tags: string[]
	title: string
}

export function WikiTable() {
	//

	//
	// A. Setup variables
	const router = useRouter();

	const { data: allwIKIData, error: allwIKIError, isLoading: allwIKILoading } = useSWR<ParsedMdxFile[], Error>('http://localhost:52020/wiki/', swrFetcher);

	const columns: DataTableColumn<ParsedMdxFile>[] = [
		{
			accessor: '_id',
			title: 'ID',
			width: 150,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 150,
		},
		{
			accessor: 'tags',
			title: 'Categorias',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (file) => {
		router.push(`http://localhost:51000/home/${file._id}`);
	};

	//
	// C. Render components

	if (allwIKILoading) {
		return <LoadingOverlay />;
	}

	if (allwIKIError) {
		return <ErrorDisplay message={allwIKIError.message} />;
	}

	return (
		<div className={styles.container}>
			<Pane>
				<DataTable
					columns={columns}
					onRowClick={handleRowClick}
					records={allwIKIData}
				/>
			</Pane>
		</div>
	);
}
