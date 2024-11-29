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
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
)

export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Dashboard routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/network" element={<NetworkPage />} />
          <Route path="/dashboard/commissions" element={<CommissionsPage />} />
          <Route path="/dashboard/packages" element={<PackagesPage />} />
          <Route path="/dashboard/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/users/roles" element={<UserRolesPage />} />
          <Route path="/admin/users/permissions" element={<UserPermissionsPage />} />
          <Route path="/admin/packages" element={<AdminPackagesPage />} />
          <Route path="/admin/packages/categories" element={<PackageCategoriesPage />} />
          <Route path="/admin/packages/pricing" element={<PackagePricingPage />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="/admin/commissions" element={<AdminCommissionsPage />} />
          <Route path="/admin/transactions" element={<TransactionsPage />} />
          <Route path="/admin/support/tickets" element={<SupportTicketsPage />} />
          <Route path="/admin/support/faq" element={<FAQPage />} />
          <Route path="/admin/support/kb" element={<KnowledgeBasePage />} />
        </Route>

        {/* Support routes */}
        <Route element={<SupportLayout />}>
          <Route path="/support" element={<SupportDashboardPage />} />
          <Route path="/support/tickets" element={<TicketsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
