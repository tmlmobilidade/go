interface HeaderProps {
    title: string;
    description: string;
}

export default function Header({ title, description }: HeaderProps) {
    return <div>
        <h2>{title}</h2>
        <p>{description}</p>
    </div>;
}
