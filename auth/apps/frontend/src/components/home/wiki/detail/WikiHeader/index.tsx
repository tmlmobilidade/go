import { BackButton, Label } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

export function WikiHeader() {
	const router = useRouter();

	const handleClose = () => {
		router.push('http://localhost:51000/home');
	};

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
		</>
	);
}
