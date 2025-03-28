import Map from "@/components/Map";
import StopsList from "@/components/StopsList";

export default function Page() {
	return <div>
		<StopsList stops={["A", "B", "C"]} />
		<Map />
	</div>;
}
