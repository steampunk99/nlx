export function PaymentSummary({ selectedPackage, amount, isUpgrade = false }) {
  // For upgrades, use the amount directly
  // For purchases, use the package price
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  const totalAmount = isUpgrade ? amount : selectedPackage?.price;
  
  if (!totalAmount) return null;
  
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/80 to-muted">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          {isUpgrade ? 'Upgrade Price' : 'Package Price'}
        </span>
        <span className="font-medium">{formatCurrency(totalAmount)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Processing Fee</span>
        <span className="font-medium">UGX 0</span>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount</span>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  )
} 