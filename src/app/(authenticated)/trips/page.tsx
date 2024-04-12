import { getUser } from "@/app/helpers/server/auth";
import * as tripService from "@/server/modules/trip/trip.service";
import TripList from "@/app/(authenticated)/trips/trip-list";
export default async function Trips() {
  const user = await getUser();
  const trips = await tripService.findByUserId(user?.id ?? -1);
  return (
    <div className="prose max-w-none">
      <h1 className="text-center ">My Trips</h1>

      <TripList initialTrips={trips} userId={user?.id ?? -1} />
    </div>
  );
}
