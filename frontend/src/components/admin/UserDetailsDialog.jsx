import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { useAdmin } from '../../hooks/useAdmin'
import { Button } from '../ui/button'

export function UserDetailsDialog({ userId, open, onOpenChange }) {
  const { useUserDetails } = useAdmin()
  const { data: user, isLoading } = useUserDetails(userId)

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Package Information */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Package Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Package</p>
                    <p className="font-medium">{user.node?.package?.package?.name || 'No Package'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="font-medium">
                      {user.node?.package?.createdAt 
                        ? new Date(user.node.package.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Package Level</p>
                    <p className="font-medium">{user.node?.package?.package?.level || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Package Price</p>
                    <p className="font-medium">
                      {user.node?.package?.package?.price 
                        ? new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' })
                            .format(user.node.package.package.price)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>

             

              {/* Financial Information */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' })
                        .format(user.node?.availableBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Commissions</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' })
                        .format(user.commissions?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Withdrawals</p>
                    <div className="space-y-1">
                      {user.withdrawals?.length > 0 ? (
                        user.withdrawals.map(withdrawal => (
                          <div key={withdrawal.id} className="text-sm">
                            <span className="font-medium">
                              {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' })
                                .format(withdrawal.amount)}
                            </span>
                            <Badge className="ml-2" variant={withdrawal.status === 'COMPLETED' ? 'success' : 'secondary'}>
                              {withdrawal.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent withdrawals</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Commissions</p>
                    <div className="space-y-1">
                      {user.commissions?.length > 0 ? (
                        user.commissions.map(commission => (
                          <div key={commission.id} className="text-sm">
                            <span className="font-medium">
                              {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' })
                                .format(commission.amount)}
                            </span>
                            <Badge className="ml-2" variant="success">From: {commission.source?.firstName || 'N/A'}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent commissions</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">User not found</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
