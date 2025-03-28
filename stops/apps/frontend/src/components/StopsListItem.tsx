interface StopsListItemProps {
    stop: String;
}

export default function StopsList(props: StopsListItemProps) {
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
