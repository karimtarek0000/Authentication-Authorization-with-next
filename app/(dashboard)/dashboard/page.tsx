import Profile from '@/components/auth/Profile'
import Data from '@/components/dashboard/Data'
import { api } from '@/lib/auth'

interface Data {
  data: {
    userId: string
    name: string
    course: string
  }
}

export default async function Page() {
  // const data = await api.get<Data>('/data')

  return (
    <>
      {/* <h1>{data.data.userId}</h1>
      <h1>{data.data.name}</h1>
      <h1>{data.data.course}</h1> */}
      <br />
      <Profile />
      <Data />
    </>
  )
}
