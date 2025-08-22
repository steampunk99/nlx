import { ChevronRight, MessageCircle, Users, Shield, Gem, Pickaxe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SupportPage() {
  const navigate = useNavigate ? useNavigate() : null;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 md:p-6 lg:p-8">
      {/* Modern geometric background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-amber-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gem className="w-10 h-10 text-amber-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900">
              Mineral Trading Support
            </h1>
            <Pickaxe className="w-10 h-10 text-amber-600" />
          </div>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            Expert assistance for your mineral trading journey
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Support Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Get Support</h2>
              </div>

              <div className="space-y-4">
                <a 
                  href="https://t.me/+9qsr7iCdJ-g4M2E8" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl py-4 px-6 flex items-center justify-between shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="16" fill="#fff"/>
                      <path d="M23.5 9.5L19.5 23.5C19.5 23.5 19.1 24.5 18 24.5C16.9 24.5 16.7 23.5 16.7 23.5L14.5 18.5L12.5 17.5L9.5 16.5C9.5 16.5 8.5 16.1 8.5 15C8.5 13.9 9.5 13.7 9.5 13.7L22.5 9.5C22.5 9.5 23.5 9.1 23.5 9.5Z" fill="#3B82F6"/>
                    </svg>
                    <span>Customer Service</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a 
                  href="https://t.me/+9qsr7iCdJ-g4M2E8" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl py-4 px-6 flex items-center justify-between shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    <span>Trading Community</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Guidelines Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Safety Guidelines</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <p className="text-gray-700">Contact our verified customer service for any platform-related questions</p>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <p className="text-gray-700">Allow time for our support team to respond during peak trading hours</p>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <p className="text-gray-700">Never share your password or private keys with anyone, including staff</p>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                  <p className="text-gray-700">Official staff will never contact you first - always verify through our channels</p>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">5</div>
                  <p className="text-gray-700">Join our community for the latest mineral trading insights and updates</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
