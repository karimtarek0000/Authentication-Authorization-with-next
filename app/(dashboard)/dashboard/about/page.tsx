import { $checkPermissions, PAGES, permissions } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Page() {
  const permiss = await permissions()
  const hasPermissions = $checkPermissions(permiss, {
    permission: 'edit_testing',
  })

  if (!hasPermissions) {
    return redirect(PAGES['dashboard'])
  }

  return (
    <>
      <h1>About page</h1>
      {/* <h3>{profile.join(' | ')}</h3> */}
      <Link href="/dashboard">Go to Dashboard Page</Link>
    </>
  )
}
