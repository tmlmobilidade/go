interface ItemProps {
    stop: String;
}

export default function Item(props: ItemProps) {
    return <div>
        {/* Left Side */}
        <div>
            <div>Rua Carlos...</div>
            <div>010001</div>
            <div>38.75 -9.95</div>
        </div>

        {/* Right Side */}
        <div>
            Icon
        </div>
    </div>;
}
