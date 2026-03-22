import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase/config'

export default function useAuth() {
  const [user, loading, error] = useAuthState(auth)

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
  }
}