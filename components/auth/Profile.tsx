'use client'

import { useAuthActions, useAuthState } from '@/lib/auth/Provider'

const Profile = () => {
  const { user, permissions } = useAuthState()
  const { logout } = useAuthActions()

  return (
    <>
      <h1>Client</h1>
      <h2>Id from client: {user?.id}</h2>
      <h2>Name from client: {user?.name}</h2>
      <h2>Permissions from client: {permissions.join(' | ')}</h2>
      <button onClick={logout}>Logout</button>
    </>
  )
}

export default Profile
