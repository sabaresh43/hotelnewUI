import { SearchStaysForm } from "@/components/sections/SearchStaysForm";
import { auth } from "@/lib/auth";
async function HotelSearchQueryPage({ params }) {
  const session = await auth();
  return (
    <section className="mx-auto mb-8 rounded-[16px] bg-white px-[24px] py-[32px] shadow-md">
      <SearchStaysForm params={params} session={session} />
    </section>
  );
}

export default HotelSearchQueryPage;
