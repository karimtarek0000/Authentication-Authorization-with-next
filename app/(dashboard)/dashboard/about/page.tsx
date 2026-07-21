import { userProfile } from '@/lib/auth'
import Link from 'next/link'

export default async function Page() {
  // const profile = await userProfile()

  return (
    <>
      <h1>About page</h1>
      <Link href="/dashboard">Go to Dashboard Page</Link>
    </>
  )
}
