interface ItemProps {
    label: string;
    type: string;
    value: string;
}

export default function Item({ label, type, value }: ItemProps) {
    return <div>
        <div>{label}</div>
        <input type={type} value={value} readOnly />
    </div>;
}
