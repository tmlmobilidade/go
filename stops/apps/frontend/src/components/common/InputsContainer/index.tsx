import { ReactNode } from "react";

interface InputsContainerProps {
    children: ReactNode[];
}

export default function InputsContainer({ children }: InputsContainerProps) {
    return <div>
        {children.map(child => child)}
    </div>;
}
