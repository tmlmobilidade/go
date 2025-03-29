// import AlertForm from '@/components/AlertDetail/AlertForm';
// import { AlertDetailContextProvider } from '@/contexts/AlertDetail.context';

// import StopContainer from "@/components/StopContainer";
// import StopsList from "@/components/StopsList";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div>
            ID
            {/* <StopsList stops={["A", "B", "C"]} /> */}
            {/* <StopContainer /> */}
        </div>
        // <AlertDetailContextProvider alertId={id}>
        //     <AlertForm />
        // </AlertDetailContextProvider>
    );
}
