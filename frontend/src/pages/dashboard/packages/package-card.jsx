// components/packages/PackageCard.jsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function PackageCard({ pkg, onPurchase, isActive }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card className={cn(
        "relative h-full overflow-hidden transition-colors hover:border-primary",
        isActive && "border-primary bg-primary/5"
      )}>
        {isActive && (
          <div className="absolute top-0 right-0 p-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Active
            </Badge>
          </div>
        )}
        <CardHeader>
          <CardTitle>{pkg.name}</CardTitle>
          <CardDescription>{pkg.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-2xl font-bold">{formatCurrency(pkg.price)}</div>
          <div className="space-y-2">
            {pkg.features?.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
          <Button 
            onClick={() => onPurchase(pkg)} 
            disabled={isActive}
            className="w-full"
          >
            {isActive ? 'Current Package' : 'Purchase Package'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}