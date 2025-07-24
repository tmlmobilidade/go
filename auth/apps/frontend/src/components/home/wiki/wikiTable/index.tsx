'use client';

import { DataTable, DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, TagGroup } from '@tmlmobilidade/ui';
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
			render: item => <TagGroup limit={10} tags={item.tags.map(tag => ({ label: tag, variant: 'secondary' }))} />,
			title: 'Categorias',
			width: 600,
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
			<hr />
			<h1 className={styles.title}>WIKI</h1>
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
