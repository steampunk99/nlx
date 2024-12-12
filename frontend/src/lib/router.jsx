import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { SupportLayout } from '../layouts/SupportLayout'
import { AuthLayout } from '../layouts/AuthLayout'

// Lazy load components
const HomePage = lazy(() => import('../pages/home'))
const LoginPage = lazy(() => import('../pages/auth/login'))
const RegisterPage = lazy(() => import('../pages/auth/register'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password'))
const ResetPasswordPage = lazy(() => import('../pages/auth/reset-password'))
const DashboardPage = lazy(() => import('../pages/dashboard/overview'))
const NetworkPage = lazy(() => import('../pages/dashboard/network'))
const CommissionsPage = lazy(() => import('../pages/dashboard/commissions'))
const PackagesPage = lazy(() => import('../pages/dashboard/packages'))
const WithdrawalsPage = lazy(() => import('../pages/dashboard/withdrawals'))
const ProfilePage = lazy(() => import('../pages/dashboard/profile'))

// Legal Pages
const TermsPage = lazy(() => import('../pages/legal/terms'))
const PrivacyPage = lazy(() => import('../pages/legal/privacy'))

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/index'))
const UsersPage = lazy(() => import('../pages/admin/users'))
const AdminPackagesPage = lazy(() => import('../pages/admin/packages'))
const AdminWithdrawalsPage = lazy(() => import('../pages/admin/withdrawals'))
const UserRolesPage = lazy(() => import('../pages/admin/users/roles'))
const UserPermissionsPage = lazy(() => import('../pages/admin/users/permissions'))
const PackageCategoriesPage = lazy(() => import('../pages/admin/packages/categories'))
const PackagePricingPage = lazy(() => import('../pages/admin/packages/pricing'))
const TransactionsPage = lazy(() => import('../pages/admin/finance/transactions'))
const AdminCommissionsPage = lazy(() => import('../pages/admin/finance/commissions'))
const SupportTicketsPage = lazy(() => import('../pages/admin/support/tickets'))
const FAQPage = lazy(() => import('../pages/admin/support/faq'))
const KnowledgeBasePage = lazy(() => import('../pages/admin/support/kb'))

// Support Pages
const SupportDashboardPage = lazy(() => import('../pages/support/index'))
const TicketsPage = lazy(() => import('../pages/support/tickets'))

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
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="commissions" element={<CommissionsPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="withdrawals" element={<WithdrawalsPage />} />
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="support/tickets" element={<SupportTicketsPage />} />
          <Route path="support/faq" element={<FAQPage />} />
          <Route path="support/kb" element={<KnowledgeBasePage />} />
        </Route>

        {/* Support Routes */}
        <Route path="/support" element={<SupportLayout />}>
          <Route index element={<SupportDashboardPage />} />
          <Route path="tickets" element={<TicketsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
