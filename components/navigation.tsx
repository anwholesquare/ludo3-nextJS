'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-4 left-4 z-50">
      <div className="flex gap-2">
        {pathname !== '/' && (
          <Button variant="outline" asChild>
            <Link href="/">
              ← Home
            </Link>
          </Button>
        )}
        {pathname !== '/simulate' && (
          <Button variant="outline" asChild>
            <Link href="/simulate">
              🎲 Simulate
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
