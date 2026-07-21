import Profile from '@/components/auth/Profile'
import Data from '@/components/dashboard/Data'
import { permissions } from '@/lib/auth'
import { fetchServer } from '@/lib/auth/Call'
import Link from 'next/link'

interface Data {
  data: {
    userId: string
    name: string
    course: string
  }
}

export default async function Page() {
  const permis = await permissions()
  const data = await fetchServer<Data>('/data')

  return (
    <>
      <h1>Server</h1>
      <h2>{data.data.userId}</h2>
      <h2>{data.data.name}</h2>
      <h2>{data.data.course}</h2>
      <h2>{permis.join(' | ')}</h2>
      <br />
      <Profile />
      <Data />
      <Link href="/dashboard/about">Go to About Page</Link>
    </>
  )
}
