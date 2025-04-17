import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import { Button } from '../../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function  ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }
  }, [token, navigate])

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
  })

  const onSubmit = async (values) => {
    if (!token) return;
    
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: values.password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Password reset successful');
        setIsSubmitted(true);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const content = isSubmitted ? (
    <div className="w-full max-w-[350px] space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Password reset successful
        </h1>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now login with your new password.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link to="/login">Back to login</Link>
      </Button>
    </div>
  ) : (
    <div className="w-full max-w-[350px] space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-400" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        <Link
          to="/login"
          className="text-emerald-600 hover:text-emerald-400"
        >
          Back to login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-black text-white items-center justify-center p-4">
      {content}
    </div>
  )
}
