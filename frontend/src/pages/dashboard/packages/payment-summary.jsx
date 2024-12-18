export function PaymentSummary({ selectedPackage }) {
  if (!selectedPackage) return null;
  
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/80 to-muted">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Package Price</span>
        <span className="font-medium">{(selectedPackage.price)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Processing Fee</span>
        <span className="font-medium">UGX 0</span>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount</span>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {(selectedPackage.price)}
          </span>
        </div>
      </div>
    </div>
  )
}