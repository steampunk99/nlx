import { lazy, Suspense } from 'react'
import { Routes, Route, useLoaderData } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { SupportLayout } from '../layouts/SupportLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import UpgradePage from '@/pages/dashboard/packages/upgrade'
import { usePackages } from '../hooks/usePackages'
import { toast } from '../components/ui/use-toast'
import NotFoundPage from '../pages/NotFound'
import PaymentStatusPage from '@/pages/auth/payment-status'
import AdminSettingsPage from '@/pages/admin/settings'
import AdminWithdrawalsPage from '../pages/admin/finance/withdrawals'

// Lazy load components
const HomePage = lazy(() => import('../pages/home'))
const LoginPage = lazy(() => import('../pages/auth/login'))
const RegisterPage = lazy(() => import('../pages/auth/register'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password'))
const ResetPasswordPage = lazy(() => import('../pages/auth/reset-password'))
const DashboardPage = lazy(() => import('../pages/dashboard/overview'))
const NetworkPage = lazy(() => import('../pages/dashboard/network'))
const CommissionsPage = lazy(() => import('../pages/dashboard/commissions'))
const PackagesPage = lazy(() => import('../pages/dashboard/packages/packages'))
const WithdrawalsPage = lazy(() => import('../pages/dashboard/withdrawals'))
const ProfilePage = lazy(() => import('../pages/dashboard/profile'))
const ActivationPage = lazy(() => import('../pages/auth/activation'))
const ActivatePaymentPage = lazy(() => import('../pages/auth/payments'))



// Legal Pages
const TermsPage = lazy(() => import('../pages/legal/terms'))
const PrivacyPage = lazy(() => import('../pages/legal/privacy'))

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/index'))
const UsersPage = lazy(() => import('../pages/admin/users/users'))
const AdminPackagesPage = lazy(() => import('../pages/admin/packages/index'))
const UserRolesPage = lazy(() => import('../pages/admin/users/roles'))
const UserPermissionsPage = lazy(() => import('../pages/admin/users/permissions'))
const PackageCategoriesPage = lazy(() => import('../pages/admin/packages/categories'))
const PackagePricingPage = lazy(() => import('../pages/admin/packages/pricing'))
const TransactionsPage = lazy(() => import('../pages/admin/finance/transactions'))
const AdminCommissionsPage = lazy(() => import('../pages/admin/finance/commissions'))
const SupportTicketsPage = lazy(() => import('../pages/admin/support/tickets'))
const FAQPage = lazy(() => import('../pages/admin/support/faq'))
// const KnowledgeBasePage = lazy(() => import('../pages/admin/support/kb'))
const USDTPaymentStatusPage = lazy(() => import('../pages/auth/usdt-payment-status'))
const ManualPayment = lazy(() => import('../pages/auth/manualPayment'))
const ManualPaymentStatusPage = lazy(() => import('../pages/auth/manual-payment-status'))

// Support Pages
// const SupportDashboardPage = lazy(() => import('../pages/support/index'))
// const TicketsPage = lazy(() => import('../pages/support/tickets'))

// Loading component for Suspense
const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
  </div>
)


export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
      <Route path="*" element={<NotFoundPage />} />
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/activation" element={<ActivationPage />} />
          <Route path="/activate/payment" element={<ActivatePaymentPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          <Route path="/usdt-payment-status" element={<USDTPaymentStatusPage />} />
          <Route path="/manual-payment" element={<ManualPayment />} />
          <Route path="/manual-payment-status" element={<ManualPaymentStatusPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />} >
          <Route index element={<DashboardPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="commissions" element={<CommissionsPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="upgrade" element={<UpgradePage />} />
          <Route path="withdrawals" element={<WithdrawalsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="activation" element={<ActivationPage />} />
          <Route path="activate/payment" element={<ActivatePaymentPage />} />
        
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/roles" element={<UserRolesPage />} />
          <Route path="users/permissions" element={<UserPermissionsPage />} />
          <Route path="packages" element={<AdminPackagesPage />} />
          <Route path="packages/categories" element={<PackageCategoriesPage />} />
          <Route path="packages/pricing" element={<PackagePricingPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="finance/transactions" element={<TransactionsPage />} />
          <Route path="finance/commissions" element={<AdminCommissionsPage />} />
          <Route path="finance/withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="support/tickets" element={<SupportTicketsPage />} />
          <Route path="support/faq" element={<FAQPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          {/* <Route path="support/kb" element={<KnowledgeBasePage />} /> */}
        </Route>

        {/* Support Routes */}
        <Route path="/support" element={<SupportLayout />}>
              {/* <Route index element={<SupportDashboardPage />} />
              <Route path="tickets" element={<TicketsPage />} /> */}
        </Route>
      </Routes>
    </Suspense>
  )
}
