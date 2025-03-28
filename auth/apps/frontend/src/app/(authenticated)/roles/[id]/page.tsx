import RoleForm from '@/components/RoleDetail/RoleForm';
import { RoleDetailContextProvider } from '@/contexts/RoleDetail.context';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return (
		<RoleDetailContextProvider role_id={id}>
			<RoleForm />
		</RoleDetailContextProvider>
	);
}
