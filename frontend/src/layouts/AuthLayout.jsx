import { Link, Outlet } from 'react-router-dom'
import { Header } from '../components/home/header'
import { Toaster } from 'react-hot-toast'

export function AuthLayout() {
  return (
    <div className="">
      <Header />
      <Toaster />
      <Outlet />
    </div>
  )
}
