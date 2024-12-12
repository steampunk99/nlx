import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
  ArrowRight,
  DollarSign,
  Users,
  BarChart,
  Shield,
  Award,
  ChevronRight,
} from "lucide-react"
import { HeroSection } from "../components/home/hero-section"
import { FeaturesSection } from "../components/home/features-section"

import { CTASection } from "../components/home/cta-section"
import { Header } from "../components/home/header"
import { Footer } from "../components/home/footer"

const features = [
  {
    name: "Earn More",
    description:
      "Unlock unlimited earning potential through our innovative MLM structure and commission system.",
    icon: DollarSign,
  },
  {
    name: "Build Teams",
    description:
      "Create and grow your network with our intuitive team building tools and support system.",
    icon: Users,
  },
  {
    name: "Track Growth",
    description:
      "Monitor your network's performance with real-time analytics and detailed reports.",
    icon: BarChart,
  },
  {
    name: "Secure Platform",
    description:
      "Rest easy knowing your earnings and data are protected by state-of-the-art security.",
    icon: Shield,
  },
]

const packages = [
  {
    name: "Starter",
    price: "499",
    features: [
      "Basic network tools",
      "5% commission rate",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    name: "Professional",
    price: "999",
    popular: true,
    features: [
      "Advanced network tools",
      "10% commission rate",
      "Priority support",
      "Advanced analytics",
      "Team training resources",
    ],
  },
  {
    name: "Enterprise",
    price: "1999",
    features: [
      "Premium network tools",
      "15% commission rate",
      "24/7 VIP support",
      "Premium analytics",
      "Exclusive training",
      "Direct mentorship",
    ],
  },
]

function HomePage() {
  return (
    <div className="relative">
        <HeroSection />
        <FeaturesSection features={features} />
        <CTASection />
    </div>
  )
}

export default HomePage
