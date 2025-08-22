import { useAuth } from '../../hooks/auth/useAuth'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, Mail, Phone, Camera, Shield, Briefcase, CalendarDays, Edit3, Save, Loader2, Eye, EyeOff, Gem, Pickaxe, Settings2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { usePackages } from '../../hooks/payments/usePackages'
import { useSiteConfig } from '../../hooks/config/useSiteConfig'

const classNames = (...classes) => classes.filter(Boolean).join(' ')

function MineralCrystalIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path d="M16 4L22 12L16 28L10 12Z" fill="url(#crystal-gradient)" stroke="#f59e0b" strokeWidth="1.5"/>
      <path d="M10 12L16 8L22 12L16 16Z" fill="#fbbf24" opacity="0.8"/>
      <defs>
        <linearGradient id="crystal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function GeometricPattern(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <circle cx="50" cy="50" r="20" fill="#f59e0b" opacity="0.1"/>
      <circle cx="150" cy="150" r="30" fill="#fbbf24" opacity="0.1"/>
      <polygon points="100,20 120,60 80,60" fill="#f59e0b" opacity="0.15"/>
      <polygon points="40,120 60,160 20,160" fill="#fbbf24" opacity="0.15"/>
    </svg>
  )
}

export default function ProfilePage() {
  const { user, profile, updateProfile, changePassword, isLoading: authLoading } = useAuth()
  const { userPackage, isLoading: packageLoading } = usePackages()
  const { siteName } = useSiteConfig()
  const [isUploading, setIsUploading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, setValue: setProfileValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    }
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, watch: watchPassword, reset: resetPasswordForm } = useForm()

  useEffect(() => {
    if (profile) {
      setProfileValue('firstName', profile.firstName || '')
      setProfileValue('lastName', profile.lastName || '')
      setProfileValue('phone', profile.phone || '')
    }
  }, [profile, setProfileValue])

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Max 2MB allowed.")
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, GIF allowed.")
      return;
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Profile picture updated successfully (simulated)')
    } catch (error) {
      const err = error
      toast.error(err.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const onUpdateProfile = async (data) => {
    await updateProfile(data)
  }

  const onChangePassword = async (data) => {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
    resetPasswordForm()
  }

  const newPasswordValue = watchPassword("newPassword", "");

  if (!profile && authLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-6 bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0]">
        <Loader2 className="w-12 h-12 text-[#4e3b1f] animate-spin" />
      </div>
    )
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'
  }
  
  const formatDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-amber-900 overflow-hidden font-sans">
      {/* Modern Geometric Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl"/>
        <MineralCrystalIcon className="absolute left-8 top-8 w-32 h-32 opacity-10" />
        <GeometricPattern className="absolute right-8 bottom-8 w-40 h-40 opacity-10" />
      </div>

      <motion.div
        className="relative z-10 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Settings2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-amber-900">
                  Profile Settings
                </h1>
                <p className="text-amber-700/80 font-medium text-base md:text-lg mt-1">
                  Manage your mining account and security.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="relative bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl shadow-xl p-6 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-28 md:w-28 ring-4 ring-amber-300 shadow-lg border-2 border-white bg-gradient-to-br from-amber-200 to-orange-200">
                    <AvatarImage src={profile?.avatarUrl || user?.avatarUrl} alt={`${profile?.firstName} ${profile?.lastName}`} />
                    <AvatarFallback className="text-3xl md:text-4xl font-semibold text-amber-800">
                      {getInitials(profile?.firstName, profile?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor="avatarUpload"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-center cursor-pointer hover:from-amber-700 hover:to-orange-700 transition-all shadow-md border-2 border-white"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                    <input id="avatarUpload" type="file" className="sr-only" onChange={handleAvatarUpload} accept="image/*" disabled={isUploading} />
                  </Label>
                </div>
              </div>

              <div className="mt-20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gem className="h-5 w-5 text-amber-600" />
                  <h2 className="text-2xl font-bold text-amber-900">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile?.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    <span className={`h-2 w-2 rounded-full ${profile?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-amber-700/90 text-sm font-medium">{profile?.email}</p>
              
                </div>

              <div className="mt-6 space-y-3 text-left text-sm">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/30 hover:border-amber-300/50 transition-colors">
                  <span className="flex items-center text-amber-700 font-medium"><User size={16} className="mr-2 text-amber-600" /> Username</span>
                  <span className="font-semibold text-amber-900">{profile?.username || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/30 hover:border-amber-300/50 transition-colors">
                  <span className="flex items-center text-amber-700 font-medium"><Phone size={16} className="mr-2 text-amber-600" /> Phone</span>
                  <span className="font-semibold text-amber-900">{profile?.phone || 'Not set'}</span>
                </div>
              
                {userPackage && !packageLoading && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/30 hover:border-amber-300/50 transition-colors">
                    <span className="flex items-center text-amber-700 font-medium"><Pickaxe size={16} className="mr-2 text-amber-600" /> Mining Package</span>
                    <span className="font-semibold text-amber-900">{userPackage?.package?.name || 'N/A'}</span>
                  </div>
                )}
                  </div>
                </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
                <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-amber-50/80 border border-amber-200/30 rounded-xl p-1">
                    <TabsTrigger 
                      value="personal"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-amber-700 rounded-lg py-3 font-semibold transition-all hover:bg-amber-100/50"
                    >
                      <Edit3 className="w-5 h-5 mr-2" /> Personal Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-amber-700 rounded-lg py-3 font-semibold transition-all hover:bg-amber-100/50"
                    >
                      <Lock className="w-5 h-5 mr-2" /> Security
                    </TabsTrigger>
                  </TabsList>

                <TabsContent value="personal" className="mt-6 space-y-6">
                  <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-5">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-semibold text-amber-800 flex items-center gap-1 mb-2">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600/70" />
                        <Input
                          id="firstName"
                          {...registerProfile('firstName', { required: 'First name is required' })}
                          className={classNames(
                            "pl-10 pr-4 py-3 bg-white/90 border border-amber-200/60 rounded-xl text-amber-900 placeholder-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all",
                            profileErrors.firstName ? "border-red-400 focus:ring-red-400/20" : ""
                          )}
                          placeholder="Your first name"
                        />
                          </div>
                      {profileErrors.firstName && <p className="mt-1 text-xs text-red-600">{String(profileErrors.firstName.message)}</p>}
                        </div>

                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-[#8D6748] flex items-center gap-1 mb-1.5">Last Name</Label>
                          <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C97C3A]/70" />
                            <Input
                              id="lastName"
                          {...registerProfile('lastName', { required: 'Last name is required' })}
                          className={classNames(
                            "pl-10 pr-4 py-3 bg-white/70 border border-[#b6d7b0]/60 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/50 focus:border-[#b6d7b0] focus:ring-1 focus:ring-[#b6d7b0]/70 transition",
                            profileErrors.lastName ? "border-red-500 focus:ring-red-500/50" : ""
                          )}
                          placeholder="Your last name"
                        />
                          </div>
                      {profileErrors.lastName && <p className="mt-1 text-xs text-red-600">{String(profileErrors.lastName.message)}</p>}
                        </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-[#8D6748] flex items-center gap-1 mb-1.5">Phone Number</Label>
                          <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C97C3A]/70" />
                            <Input
                              id="phone"
                              type="tel"
                          {...registerProfile('phone')}
                           className={classNames(
                            "pl-10 pr-4 py-3 bg-white/70 border border-[#b6d7b0]/60 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/50 focus:border-[#b6d7b0] focus:ring-1 focus:ring-[#b6d7b0]/70 transition",
                            profileErrors.phone ? "border-red-500 focus:ring-red-500/50" : ""
                          )}
                          placeholder="e.g. 0701234567"
                        />
                          </div>
                       {profileErrors.phone && <p className="mt-1 text-xs text-red-600">{String(profileErrors.phone.message)}</p>}
                        </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-[#8D6748] flex items-center gap-1 mb-1.5">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C97C3A]/70" />
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className="pl-10 pr-4 py-3 bg-[#e6f2ef]/50 border border-[#b6d7b0]/40 rounded-lg text-[#A67C52]/80 cursor-not-allowed"
                        />
                      </div>
                       <p className="mt-1 text-xs text-[#A67C52]/70">Email address cannot be changed.</p>
                    </div>

                      <Button
                        type="submit"
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-[#4e3b1f] bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] hover:from-[#b6d7b0]/90 hover:to-[#ffe066]/90 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C97C3A]/70"
                      >
                      {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                      </Button>
                    </form>
                  </TabsContent>

                <TabsContent value="security" className="mt-6 space-y-6">
                  <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-5">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm font-medium text-[#8D6748] flex items-center gap-1 mb-1.5">Current Password</Label>
                          <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C97C3A]/70" />
                            <Input
                              id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          {...registerPassword('currentPassword', { required: 'Current password is required' })}
                          className={classNames(
                            "pl-10 pr-10 py-3 bg-white/70 border border-[#b6d7b0]/60 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/50 focus:border-[#b6d7b0] focus:ring-1 focus:ring-[#b6d7b0]/70 transition",
                            passwordErrors.currentPassword ? "border-red-500 focus:ring-red-500/50" : ""
                          )}
                          placeholder="Enter your current password"
                        />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A67C52]/80 hover:text-[#4e3b1f]">
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                          </div>
                      {passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{String(passwordErrors.currentPassword.message)}</p>}
                        </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-medium text-[#8D6748] flex items-center gap-1 mb-1.5">New Password</Label>
                          <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C97C3A]/70" />
                            <Input
                              id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword('newPassword', { 
                            required: 'New password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                          })}
                          className={classNames(
                            "pl-10 pr-10 py-3 bg-white/70 border border-[#b6d7b0]/60 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/50 focus:border-[#b6d7b0] focus:ring-1 focus:ring-[#b6d7b0]/70 transition",
                            passwordErrors.newPassword ? "border-red-500 focus:ring-red-500/50" : ""
                          )}
                          placeholder="Enter your new password"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A67C52]/80 hover:text-[#4e3b1f]">
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                          </div>
                      {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-600">{String(passwordErrors.newPassword.message)}</p>}
                        </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#8D6748] flex items-center gap-1 mb-1.5">Confirm New Password</Label>
                          <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C97C3A]/70" />
                            <Input
                              id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerPassword('confirmPassword', {
                            required: 'Please confirm your new password',
                            validate: value => value === newPasswordValue || "Passwords do not match"
                          })}
                          className={classNames(
                            "pl-10 pr-10 py-3 bg-white/70 border border-[#b6d7b0]/60 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/50 focus:border-[#b6d7b0] focus:ring-1 focus:ring-[#b6d7b0]/70 transition",
                            passwordErrors.confirmPassword ? "border-red-500 focus:ring-red-500/50" : ""
                          )}
                          placeholder="Confirm your new password"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A67C52]/80 hover:text-[#4e3b1f]">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{String(passwordErrors.confirmPassword.message)}</p>}
                    </div>

                      <Button
                        type="submit"
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-[#4e3b1f] bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] hover:from-[#b6d7b0]/90 hover:to-[#ffe066]/90 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C97C3A]/70"
                      >
                      {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                      Change Password
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
