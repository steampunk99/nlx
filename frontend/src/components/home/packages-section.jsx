import { motion } from "framer-motion"
import { Check, Users, Network, Percent } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"

const animatedBorderStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .hover-card::before,
  .popular-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(
      45deg,
      #0095E7,
      #33ABED,
      #0095E7
    );
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    background-size: 200% 200%;
    animation: gradient 4s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .hover-card:hover::before {
    opacity: 1;
  }

  .popular-card::before {
    opacity: 1;
  }
`

const style = document.createElement('style')
style.textContent = animatedBorderStyles
document.head.appendChild(style)

const packages = [
  {
    name: "Starter Package",
    price: "UGX 50,000",
    period: "One-time",
    highlight: "Perfect for beginners",
    stats: {
      depth: "2 Levels",
      commission: "5%",
      referrals: "5 max"
    },
    features: [
      "5% Direct Commission",
      "2% Indirect Commission",
      "Basic Support"
    ]
  },
  {
    name: "Bronze Package",
    price: "UGX 100,000",
    period: "One-time",
    highlight: "Most popular choice",
    popular: true,
    stats: {
      depth: "3 Levels",
      commission: "10%",
      referrals: "10 max"
    },
    features: [
      "10% Direct Commission",
      "5% Indirect Commission",
      "Priority Support"
    ]
  },
  {
    name: "Silver Package",
    price: "UGX 250,000",
    period: "One-time",
    highlight: "For serious networkers",
    stats: {
      depth: "4 Levels",
      commission: "15%",
      referrals: "20 max"
    },
    features: [
      "15% Direct Commission",
      "8% Indirect Commission",
      "VIP Support"
    ]
  },
  {
    name: "Gold Package",
    price: "UGX 500,000",
    period: "One-time",
    highlight: "Maximum benefits",
    stats: {
      depth: "5 Levels",
      commission: "20%",
      referrals: "50 max"
    },
    features: [
      "20% Direct Commission",
      "10% Indirect Commission",
      "Premium Support"
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function PackagesSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-[#F5F9FF]" id="packages">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,#F5F9FF_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0095E7_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Investment Packages
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl">
              Choose the perfect investment package that aligns with your goals
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={cardVariants}
              className={`relative group ${pkg.popular ? 'lg:-mt-4' : ''}`}
            >
              <div 
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0095E7] via-[#33ABED] to-[#0095E7] bg-[length:400%_400%] animate-gradient ${pkg.popular ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500`} 
              />
              
              <div className="relative rounded-2xl bg-white m-[2px] h-full">
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center rounded-full bg-[#0095E7] px-3 py-0.5 text-xs font-semibold text-white shadow-lg">
                      Popular Choice
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500">{pkg.highlight}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-2xl font-bold text-[#0095E7]">{pkg.price}</span>
                    <span className="text-sm text-gray-500"> / {pkg.period}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 mb-6 rounded-lg bg-gray-50">
                    <div className="text-center">
                      <Network className="w-4 h-4 mx-auto mb-1 text-[#0095E7]" />
                      <p className="text-xs font-medium text-gray-900">{pkg.stats.depth}</p>
                    </div>
                    <div className="text-center">
                      <Percent className="w-4 h-4 mx-auto mb-1 text-[#0095E7]" />
                      <p className="text-xs font-medium text-gray-900">{pkg.stats.commission}</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-4 h-4 mx-auto mb-1 text-[#0095E7]" />
                      <p className="text-xs font-medium text-gray-900">{pkg.stats.referrals}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-[#0095E7]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      pkg.popular
                        ? 'bg-[#0095E7] hover:bg-[#0077B6] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                    } transition-colors duration-200`}
                    asChild
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">
            All packages include access to our member dashboard and support.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
