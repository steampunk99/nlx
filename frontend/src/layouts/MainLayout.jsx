import { Outlet } from 'react-router-dom'
import { Header } from '../components/home/header'
import { Footer } from '../components/home/footer'

export function MainLayout() {
  return (
    <div className="relative min-h-screen bg-black">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
