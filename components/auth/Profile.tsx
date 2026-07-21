'use client'

import { useAuthActions, useAuthState } from '@/lib/auth'

const Profile = () => {
  const { user, permissions } = useAuthState()
  const { logout } = useAuthActions()

  return (
    <>
      <h2>Id: {user?.id}</h2>
      <h2>name: {user?.name}</h2>
      <h2>{permissions.join(' | ')}</h2>
      <button onClick={logout}>Logout</button>
    </>
  )
}

export default Profile
