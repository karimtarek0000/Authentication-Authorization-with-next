import { CanView } from '@/lib/auth/Components'
import Link from 'next/link'

export default async function Page() {
  return (
    <>
      <h1>About page</h1>
      <Link href="/dashboard">Go to Dashboard Page</Link>
      <CanView
        permissionRequirement={{
          permission: 'edit_testing',
        }}
      >
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa unde, atque hic pariatur rem
          id dolor voluptatem. Beatae, facilis rerum et eligendi porro unde dicta adipisci sapiente,
          ratione tempore fugiat repellendus repudiandae, iure expedita enim inventore
          exercitationem facere incidunt libero tempora voluptatum! Porro debitis possimus
          voluptatem maxime rerum corporis, fugiat expedita blanditiis consectetur optio perferendis
          ipsum est? Eius ex quaerat vel, molestiae molestias ducimus inventore expedita saepe quo
          dolores omnis quod, corporis ipsam iste eum, accusantium itaque. Voluptatem at quam
          possimus quae libero numquam! Dolor neque aperiam repellat eum? Id neque ut minima?
          Fugiat, atque deserunt! Magni suscipit doloribus dolorum!
        </p>
      </CanView>
    </>
  )
}
