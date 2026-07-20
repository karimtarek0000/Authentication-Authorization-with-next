'use client'

import { useAuthActions, useAuthState } from '@/lib/auth'

const Profile = () => {
  const { user, isAuth, accessToken } = useAuthState()
  const { logout } = useAuthActions()

  return (
    <>
      <h2>accessToken: {accessToken}</h2>
      <h2>Id: {user?.id}</h2>
      <h2>name: {user?.name}</h2>
      <h2>isAuth: {`${isAuth}`}</h2>
      <button onClick={logout}>Logout</button>
    </>
  )
}

export default Profile
