import UserForm from '@/components/UserDetail/UserForm';
import { UserDetailContextProvider } from '@/contexts/UserDetail.context';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return (
		<UserDetailContextProvider user_id={id}>
			<UserForm />
		</UserDetailContextProvider>
	);
}
