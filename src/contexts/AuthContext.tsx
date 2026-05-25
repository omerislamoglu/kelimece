import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle as firebaseGoogle,
  signInWithApple as firebaseApple,
  signOut as firebaseSignOut,
  type User,
} from '../lib/firebase'
import { syncFromCloud } from '../lib/sync'

interface AuthState {
  user: User | null
  loading: boolean
  syncing: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevUid = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)

      // Kullanici giris yaptiysa ve uid degistiyse sync et
      if (u && u.uid !== prevUid.current) {
        prevUid.current = u.uid
        setSyncing(true)
        try {
          await syncFromCloud()
        } catch (e) {
          console.warn('[Auth] Sync hatasi:', e)
        } finally {
          setSyncing(false)
        }
      } else if (!u) {
        prevUid.current = null
      }
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      await firebaseGoogle()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Giriş başarısız'
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg)
      }
    }
  }, [])

  const signInWithApple = useCallback(async () => {
    setError(null)
    try {
      await firebaseApple()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Giriş başarısız'
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg)
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await firebaseSignOut()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Çıkış başarısız')
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncing,
        error,
        signInWithGoogle,
        signInWithApple,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
