import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowUpCircle } from "lucide-react"

export function UpgradePackageModal({ open, onClose, currentPackage, availablePackages }) {
  const navigate = useNavigate()

  const handleUpgrade = (newPackage) => {
    navigate('/dashboard/upgrade', {
      state: {
        currentPackage: currentPackage?.package || currentPackage,
        newPackage
      }
    })
    onClose()
  }

  // Filter packages that are higher tier than current package
  const upgradeOptions = availablePackages?.filter(pkg => 
    pkg.price > (currentPackage?.package?.price || currentPackage?.price) && 
    pkg.id !== (currentPackage?.package?.id || currentPackage?.id)
  ) || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade Package</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {upgradeOptions.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No upgrade options available for your current package.
            </p>
          ) : (
            upgradeOptions.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div>
                  <h4 className="font-medium">{pkg.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Price: {pkg.price}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Difference: +{pkg.price - (currentPackage?.package?.price || currentPackage?.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleUpgrade(pkg)}
                  className="ml-4"
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 