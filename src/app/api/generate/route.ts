import { initData, testCleanUp } from "@/server/__tests__/helpers";
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('I don\'t generate nothing this time')
  }
  await testCleanUp()
  const data = await initData()
  return new Response(
    JSON.stringify({ users: data.relationUsers, trips: data.relationTrips }),
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}