import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import { Button } from '../../components/ui/button'
import toast from 'react-hot-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { useState } from 'react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values) {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Check your email for password reset instructions');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to send reset email');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-stone-50 items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-mono font-semibold text-stone-900">Forgot Password</h1>
          <p className="text-stone-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@gmail.com"
                      type="email"
                      disabled={isLoading}
                      className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-md transition duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-stone-600">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-amber-700 hover:text-amber-800"
          >
            Sign in
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
