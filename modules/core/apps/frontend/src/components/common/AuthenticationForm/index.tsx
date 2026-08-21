'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { Button, EnvironmentTag, keepUrlParams, Label, Section, Surface, TMLogoDark, TMLogoLight, WhenMode } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface AuthenticationFormProps {
	description: string
	footerLabel: string
	footerUrl: string
	loading: boolean
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
	submitDisabled: boolean
	submitLabel: string
	title: string
}

/* * */

export function AuthenticationForm({ children, description, footerLabel, footerUrl, loading, onSubmit, submitDisabled, submitLabel, title }: PropsWithChildren<AuthenticationFormProps>) {
	//

	//
	// A. Handle actions

	const handleFooterClick = () => {
		window.location.href = keepUrlParams(footerUrl);
	};

	//
	// B. Render components

	return (
		<div className={styles.root}>
			<Surface>
				<Section>

					<div className={styles.header}>
						<div className={styles.headerContent}>
							<Label size="lg">{title}</Label>
							<Label>{description}</Label>
							<EnvironmentTag />
						</div>
						<div className={styles.headerLogo}>
							<WhenMode dark={<TMLogoDark />} light={<TMLogoLight />} />
						</div>
					</div>

					<form className={styles.form} onSubmit={onSubmit}>

						{children}

						<div className={styles.formFooter}>
							<span
								className={styles.resetLink}
								onClick={handleFooterClick}
								style={{ cursor: 'pointer' }}
							>
								<Label size="sm" caps>{footerLabel}</Label>
							</span>
							<Button
								disabled={submitDisabled}
								icon={<IconArrowRight />}
								label={submitLabel}
								loading={loading}
								type="submit"
								variant="primary"
							/>
						</div>

					</form>

				</Section>
			</Surface>
		</div>
	);
}
