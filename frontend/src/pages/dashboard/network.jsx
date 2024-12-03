import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { Users, UserPlus, ArrowUpRight } from 'lucide-react'
import { useNetworkStats, useNetworkLevels, useRecentReferrals, useGenealogyTree } from '../../hooks/useDashboard'
import { Skeleton } from "../../components/ui/skeleton"
import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Copy, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { toast } from 'sonner'
import NetworkTree from '../../components/network/NetworkTree'

export default function NetworkPage() {
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { 
    data: referralLinkData, 
    isLoading: isLoadingReferralLink 
  } = useQuery({
    queryKey: ['referralLink'],
    queryFn: async () => {
      const { data } = await api.get('/network/referral-link')
      return data.data
    },
    enabled: isReferralModalOpen
  })

  const handleCopyLink = () => {
    if (referralLinkData?.referralLink) {
      navigator.clipboard.writeText(referralLinkData.referralLink)
        .then(() => {
          setCopied(true)
          toast.success('Referral link copied to clipboard!')
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(err => {
          toast.error('Failed to copy link')
          console.error('Copy failed', err)
        })
    }
  }

  const { data: networkStats, isLoading: isLoadingStats } = useNetworkStats()
  const { data: networkLevels, isLoading: isLoadingLevels } = useNetworkLevels()
  const { data: recentReferrals, isLoading: isLoadingReferrals } = useRecentReferrals()
  const { data: genealogyData, isLoading: isLoadingGenealogy } = useGenealogyTree()

  console.log('Genealogy Data:', genealogyData);

  if (isLoadingStats || isLoadingLevels || isLoadingReferrals || isLoadingGenealogy) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Network</h1>
          <Button 
            onClick={() => setIsReferralModalOpen(true)}
            className="inline-flex items-center justify-center"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Share Referral Link
          </Button>
        </div>

        {/* Network Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          {networkStats?.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon === 'UserPlus' ? <UserPlus className={`h-4 w-4 ${stat.color}`} /> : <Users className={`h-4 w-4 ${stat.color}`} />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className={`mt-2 flex items-center text-sm ${stat.color}`}>
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Network Visualization</CardTitle>
            <CardDescription>Interactive view of your network structure</CardDescription>
          </CardHeader>
          <CardContent>
            <NetworkTree networkData={genealogyData} />
          </CardContent>
        </Card>

        {/* Network Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Network Levels</CardTitle>
            <CardDescription>Breakdown of your network by levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-6 py-3">Level</th>
                    <th className="px-6 py-3">Members</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {networkLevels?.map((level) => (
                    <tr key={level.level} className="border-b">
                      <td className="px-6 py-4">Level {level.level}</td>
                      <td className="px-6 py-4">{level.members}</td>
                      <td className="px-6 py-4">{level.active}</td>
                      <td className="px-6 py-4">{level.earnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Latest members who joined your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReferrals?.map((referral, index) => (
                <div key={index} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon icon="ph:user" className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{referral.name}</p>
                      <p className="text-xs text-muted-foreground">{referral.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{referral.package}</p>
                    <p className={`text-xs ${referral.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog 
        open={isReferralModalOpen} 
        onOpenChange={setIsReferralModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Referral Link</DialogTitle>
            <DialogDescription>
              Share this link to invite new members to your network
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <Input 
              value={referralLinkData?.referralLink || 'Generating link...'}
              readOnly 
              className="flex-grow"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopyLink}
              disabled={isLoadingReferralLink}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Share this unique link with your network to earn referral bonuses
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
