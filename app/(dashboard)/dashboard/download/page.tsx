import Link from 'next/link'

export default async function Page() {
  return (
    <>
      <h1>Download page</h1>
      <Link href="/dashboard">Go to Dashboard Page</Link>
    </>
  )
}
