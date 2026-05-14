import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  iconColor: string
  iconBg: string
}

export function ServiceCard({ icon: Icon, title, description, href, iconColor, iconBg }: ServiceCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow group flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 shrink-0`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h2 className="font-semibold text-lg mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground flex-1 mb-4">{description}</p>
        <Button asChild className="w-full">
          <Link href={href}>
            Request service <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
