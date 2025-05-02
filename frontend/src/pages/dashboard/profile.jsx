import { useAuth } from '../../hooks/auth/useAuth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { User, Lock, Mail, Phone, Camera, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    }
  })

  const handleAvatarUpload = () => {
    setIsUploading(true)
    // TODO: Implement avatar upload
    setTimeout(() => {
      setIsUploading(false)
      toast.success('Profile picture updated successfully')
    }, 2000)
  }

  const onUpdateProfile = async (data) => {
    try {
      setIsUpdating(true)
      // TODO: Implement profile update
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const onChangePassword = async (data) => {
    try {
      setIsUpdating(true)
      // TODO: Implement password change
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative space-y-6 p-6 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-30%,#1a103b,transparent)]"></div>
        
        {/* Animated glow spots */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-cyan-300/60">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="flex flex-col gap-6 md:flex-row mt-6">
          {/* Profile Overview Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:w-1/3"
          >
            <Card className="relative bg-black/30 backdrop-blur-sm border border-cyan-500/20 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <CardHeader>
                <CardTitle className="text-cyan-100">Profile Overview</CardTitle>
                <CardDescription className="text-cyan-300/60">Your public profile information</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-2 ring-cyan-500/20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-xl text-cyan-100 border border-cyan-500/30">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-black/50 border border-cyan-500/30 hover:bg-cyan-950/50 hover:border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                    onClick={handleAvatarUpload}
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4 text-cyan-400" />
                  </Button>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-cyan-100">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-cyan-300/60">{user?.email}</p>
                </div>

                <div className="w-full space-y-2 rounded-lg bg-black/20 border border-cyan-500/20 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-300/60">Member since</span>
                    <span className="font-medium text-cyan-100">Jan 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-300/60">Status</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 border border-green-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <Card className="relative bg-black/30 backdrop-blur-sm border border-cyan-500/20 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <CardHeader>
                <CardTitle className="text-cyan-100">Account Settings</CardTitle>
                <CardDescription className="text-cyan-300/60">Update your account preferences</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-cyan-500/20">
                    <TabsTrigger 
                      value="personal"
                      className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 text-cyan-300/60"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Personal Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security"
                      className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 text-cyan-300/60"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="mt-4 space-y-4">
                    <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-cyan-300/60">First Name</Label>
                          <div className="relative">
                            <Input
                              id="firstName"
                              {...register('firstName', { required: 'First name is required' })}
                              className={cn(
                                "pl-9 bg-black/30 border text-cyan-100 focus:border-cyan-500/50",
                                errors.firstName ? "border-red-500" : "border-cyan-500/20"
                              )}
                            />
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                          </div>
                          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-cyan-300/60">Last Name</Label>
                          <div className="relative">
                            <Input
                              id="lastName"
                              {...register('lastName', { required: 'Last name is required' })}
                              className={cn(
                                "pl-9 bg-black/30 border text-cyan-100 focus:border-cyan-500/50",
                                errors.lastName ? "border-red-500" : "border-cyan-500/20"
                              )}
                            />
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                          </div>
                          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-cyan-300/60">Email</Label>
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              defaultValue={user?.email}
                              disabled
                              className="pl-9 bg-black/50 border border-cyan-500/10 text-cyan-300/60"
                            />
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-cyan-300/60" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-cyan-300/60">Phone</Label>
                          <div className="relative">
                            <Input
                              id="phone"
                              type="tel"
                              {...register('phone')}
                              className="pl-9 bg-black/30 border border-cyan-500/20 text-cyan-100 focus:border-cyan-500/50"
                            />
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="security" className="mt-4 space-y-4">
                    <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-cyan-300/60">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type="password"
                              {...register('currentPassword', { required: 'Current password is required' })}
                              className={cn(
                                "pl-9 bg-black/30 border text-cyan-100 focus:border-cyan-500/50",
                                errors.currentPassword ? "border-red-500" : "border-cyan-500/20"
                              )}
                            />
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                          </div>
                          {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-cyan-300/60">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type="password"
                              {...register('newPassword', { required: 'New password is required' })}
                              className={cn(
                                "pl-9 bg-black/30 border text-cyan-100 focus:border-cyan-500/50",
                                errors.newPassword ? "border-red-500" : "border-cyan-500/20"
                              )}
                            />
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                          </div>
                          {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-cyan-300/60">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type="password"
                              {...register('confirmPassword', { required: 'Please confirm your new password' })}
                              className={cn(
                                "pl-9 bg-black/30 border text-cyan-100 focus:border-cyan-500/50",
                                errors.confirmPassword ? "border-red-500" : "border-cyan-500/20"
                              )}
                            />
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                          </div>
                          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Changing...' : 'Change Password'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
