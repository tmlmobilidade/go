'use client';

import BasicInfoSection from '../BasicInfoSection';
import Header from '../FormHeader';
import PermissionsSection from '../PermissionsSection';

export default function UserForm() {
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
