// components/packages/PaymentMethodButton.jsx
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'

const paymentMethods = [
  {
    id: 'MTN_MOBILE',
    name: 'Mobile Money',
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>
    ),
    description: 'Pay via Mobile Money'
  }
]

export function PaymentMethodSelector({ selectedMethod, onMethodSelect }) {
  return (
    <div className="grid gap-4">
      {paymentMethods.map((method) => (
        <div key={method.id}>
         <Button
  type="button"
  variant={selectedMethod === method.id ? 'default' : 'outline'}
  className={cn(
    "flex flex-col items-center justify-center gap-3 h-24 transition-all p-4 w-full",
    selectedMethod === method.id 
      ? "bg-gradient-to-r from-primary to-purple-500 text-white" 
      : "hover:bg-muted/50"
  )}
  onClick={() => onMethodSelect(method.id)}
>
  <div className="flex flex-col items-center gap-2">
    {method.icon}
    <span className="text-sm font-medium">{method.name}</span>
  </div>
</Button>
        </div>
      ))}
    </div>
  )
}