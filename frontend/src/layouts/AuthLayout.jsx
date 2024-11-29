import { Link, Outlet } from 'react-router-dom'
import { Header } from '../components/home/header'

export function AuthLayout() {
  return (
    <div className="">
      <Header/>
    <Outlet />
    </div>
  )
}
