'use client';

import BasicInfoSection from '../BasicInfoSection';
import Header from '../FormHeader';
import PermissionsSection from '../PermissionsSection';

export default function RoleForm() {
	return (
		<>
			{/* Header */}
			<Header />
			{/* Form */}
			<BasicInfoSection />
			{/* Permissions */}
			<PermissionsSection />
		</>
	);
}
