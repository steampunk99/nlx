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
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Copy, Check, Share2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'   
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

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

  const handleShare = async () => {
    if (navigator.share && referralLinkData?.referralLink) {
      try {
        await navigator.share({
          title: 'Join my network on Triple Pride',
          text: 'Join my network and start your journey to financial freedom!',
          url: referralLinkData.referralLink
        })
        toast.success('Shared successfully!')
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share')
          console.error('Share failed', err)
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const { data: networkStats, isLoading: isLoadingStats } = useNetworkStats()
  const { data: networkLevels, isLoading: isLoadingLevels } = useNetworkLevels()
  const { data: recentReferrals, isLoading: isLoadingReferrals } = useRecentReferrals()
  const { data: genealogyData, isLoading: isLoadingGenealogy } = useGenealogyTree()

  if (isLoadingStats || isLoadingLevels || isLoadingReferrals || isLoadingGenealogy) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Network</h1>
            <p className="text-muted-foreground">Manage and grow your network</p>
          </div>
          <Button 
            onClick={() => setIsReferralModalOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white shadow-lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Share Referral Link
          </Button>
        </div>

        {/* Network Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {networkStats?.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor || 'bg-muted'}`}>
                  {stat.icon === 'UserPlus' ? 
                    <UserPlus className={`h-4 w-4 ${stat.iconColor || stat.color}`} /> : 
                    <Users className={`h-4 w-4 ${stat.iconColor || stat.color}`} />
                  }
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <div className={`mt-4 flex items-center text-sm font-medium ${stat.color}`}>
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network Visualization */}
        <Card className="overflow-hidden border-none bg-gradient-to-br from-gray-900 to-gray-800">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl text-white">Network Visualization</CardTitle>
            <CardDescription className="text-gray-400">Interactive view of your network structure</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              <NetworkTree networkData={genealogyData} />
            </div>
          </CardContent>
        </Card>

        <div className="grid-cols-1 space-y-6 gap-6 md:grid-cols-2">
          {/* Network Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Network Levels</CardTitle>
              <CardDescription>Breakdown of your network by levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Active</th>

                      {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Commissions</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {networkLevels?.map((level) => (
                      <tr key={level.level} className="bg-card hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium">Level {level.level}</td>
                        <td className="px-6 py-4">{level.members}</td>
                        <td className="px-6 py-4">{level.active}</td>
                     
                        {/* <td className="px-6 py-4 font-medium">{level.commissions}</td> */}
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
              <div className="space-y-6">
                {recentReferrals?.map((referral, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 ring-1 ring-white/10 flex items-center justify-center">
                        <Icon icon="ph:user" className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">{referral.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{referral.package}</p>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        referral.status === 'active' 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog 
        open={isReferralModalOpen} 
        onOpenChange={setIsReferralModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Referral Link</DialogTitle>
            <DialogDescription>
              Invite new members to join your network and earn rewards
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Input 
                readOnly
                value={referralLinkData?.referralLink || 'Generating link...'}
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Your referral link is unique to you. When someone joins using this link, 
              they'll be added to your network.
            </p>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
