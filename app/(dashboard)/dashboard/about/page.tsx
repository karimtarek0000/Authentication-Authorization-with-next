import Profile from '@/components/auth/Profile'
import Data from '@/components/dashboard/Data'
import { apiServer } from '@/lib/auth/Call'
import Link from 'next/link'

interface Data {
  data: {
    userId: string
    name: string
    course: string
  }
}

export default async function Page() {
  //   const data = await apiServer.get<Data>('/data')

  return (
    <>
      <h1>About page</h1>
      <Link href="/dashboard">Go to Dashboard Page</Link>
      {/* <h1>{data.data.userId}</h1>
      <h1>{data.data.name}</h1>
      <h1>{data.data.course}</h1>
      <br />
      <Profile />
      <Data /> */}
    </>
  )
}
