import { createContext, useContext, useState } from 'react';

/* Context Interface */

interface ManualContextState {
	isManual: boolean
	setIsManual: React.Dispatch<React.SetStateAction<boolean>>
}

/* Context Definition */

const ManualContext = createContext<ManualContextState | undefined>(undefined);

/* Context Usage */

export function useManualContext() {
	const context = useContext(ManualContext);
	if (!context) {
		throw new Error('useManualContext must be used within a ManualContextProvider');
	}
	return context;
}

/* Context Provider */

export const ManualContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [isManual, setIsManual] = useState<boolean>(false);

	return (
		<ManualContext.Provider value={{ isManual, setIsManual }}>
			{children}
		</ManualContext.Provider>
	);
};
