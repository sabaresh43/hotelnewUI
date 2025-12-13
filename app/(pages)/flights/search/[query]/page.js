import { SearchFlightsForm } from "@/components/sections/SearchFlightsForm";
import { auth } from "@/lib/auth";
async function FlightSearchPage({ params }) {
  const session = await auth();
  return (
    <section className="mx-auto mb-8 rounded-[16px] bg-white px-[24px] py-[32px] shadow-md">
      <SearchFlightsForm params={params} session={session} />
    </section>
  );
}

export default FlightSearchPage;
