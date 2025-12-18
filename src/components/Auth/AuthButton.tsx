import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LoginDialog } from './LoginDialog'
import { UserMenu } from './UserMenu'
import { LogIn } from 'lucide-react'

export const AuthButton = () => {
  const { session, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (session) {
    return <UserMenu />
  }

  return (
    <>
      <Button
        onClick={() => setLoginOpen(true)}
        variant="default"
        size="sm"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
