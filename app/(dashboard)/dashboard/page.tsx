import Profile from '@/components/auth/Profile'
import Data from '@/components/dashboard/Data'
import { authService } from '@/lib/auth'
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
  const permissions = await authService.permissions()
  const data = await apiServer.get<Data>('/data')

  return (
    <>
      <h1>Server</h1>
      <h2>{data.data.userId}</h2>
      <h2>{data.data.name}</h2>
      <h2>{data.data.course}</h2>
      <h2>{permissions.join(' | ')}</h2>
      <br />
      <Profile />
      <Data />
      <Link href="/dashboard/about">Go to About Page</Link>
    </>
  )
}
