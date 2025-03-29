import { ReactNode } from "react";

interface InputsRowProps {
    children: ReactNode[];
}

export default function InputsRow({ children }: InputsRowProps) {
    return <div>
        {children.map(child => child)}
    </div>;
}
