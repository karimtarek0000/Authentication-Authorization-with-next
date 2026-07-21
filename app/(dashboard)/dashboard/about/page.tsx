import Link from 'next/link'

export default async function Page() {
  // const profile = (await userProfile()).permissions

  return (
    <>
      <h1>About page</h1>
      {/* <h3>{profile.join(' | ')}</h3> */}
      <Link href="/dashboard">Go to Dashboard Page</Link>
    </>
  )
}
