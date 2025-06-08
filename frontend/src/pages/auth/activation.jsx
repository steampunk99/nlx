
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, Trophy } from "lucide-react"
import { usePackages } from "@/hooks/payments/usePackages"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { useNavigate } from "react-router-dom"

import { useCountry } from "@/hooks/config/useCountry"
import ReactCountryFlag from "react-country-flag"



export default function ActivationPage() {
  const navigate = useNavigate();
  const { country, currency, formatAmount } = useCountry();
  const { user } = useAuth();
  const { availablePackages, packagesLoading } = usePackages();

  const handlePackagePurchase = (pkg) => {
    if (user.country === "UG") {
      setTimeout(() => {
        navigate("/activate/payment", { state: { selectedPackage: pkg } });
      }, 1000);
    } else {
      setTimeout(() => {
        navigate("/manual-payment", { state: { selectedPackage: pkg } });
      }, 1000);
    }
  };

  // --- FARMING IMAGERY & TYPOGRAPHY ---
  const farmBg =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  const cocoaPodImg =
    'https://static.vecteezy.com/system/resources/previews/042/125/124/non_2x/cacao-beans-with-leaves-isolated-on-transparent-background-with-clipping-path-3d-render-free-png.png';
  const farmerImg =
    'https://st.depositphotos.com/51000486/55220/i/450/depositphotos_552200716-stock-photo-african-female-farmer-holds-her.jpg';
  const bentoColors = [
    'from-[#f8e7c1] to-[#e6f2ef]',
    'from-[#e6f2ef] to-[#f8f8f5]',
    'from-[#f8f8f5] to-[#b6d7b0]',
    'from-[#b6d7b0] to-[#f8e7c1]',
  ];

  // --- PAGE ---
  return (
    <div className="min-h-screen w-full bg-[#f8f8f5] relative overflow-x-hidden font-sans">
      {/* Hero Section with More Elaborate Farm Illustration, pushed down for nav */}
      <div className="relative w-full pt-8 md:pt-16 h-[420px] md:h-[520px] flex items-center justify-center bg-[#e6f2ef] overflow-hidden">
        {/* SVG Farm Background Illustration - More elaborate, responsive */}
       
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h1 className="font-cursive text-5xl md:text-7xl text-[#4e3b1f] drop-shadow-lg mb-4 tracking-tight text-center" style={{fontFamily:'Pacifico, cursive'}}>Grow Your Cocoa Dream</h1>
          <p className="text-xl md:text-2xl text-[#2c2c2c]/80 font-medium max-w-2xl text-center mb-6 drop-shadow-sm">
            Choose a cocoa opportunity and start your journey to a fruitful harvest.
          </p>
          <img src={cocoaPodImg} alt="Cocoa Pod" className="w-24 h-24 rounded-full border-4 border-[#fffbe6] shadow-xl animate-bounce-slow" />
        </div>
      </div>

      {/* --- Package Selection Section --- */}
      <section id="cocoa-packages" className="w-full py-10 bg-gradient-to-b from-[#e6f2ef]/80 to-[#f8f8f5] flex flex-col items-center">
        <h2 className="font-cursive text-3xl md:text-4xl text-[#2c5f63] mb-6 text-center" style={{fontFamily:'Pacifico, cursive'}}>Choose Your Cocoa Plot</h2>
        <div className="w-full p-8 overflow-x-hidden max-w-5xl flex flex-col md:flex-row gap-8 items-center md:items-stretch px-4 md:px-0 overflow-x-auto scrollbar-hide">
          {availablePackages.length > 0 ? availablePackages.map((pkg, idx) => {
            let features = Array.isArray(pkg.features) ? pkg.features : [];
            let extraPerks = Array.isArray(pkg.extraPerks) ? pkg.extraPerks : [];
            const colorIdx = idx % bentoColors.length;
            return (
              <div key={pkg.id || idx} className={`flex-1 min-w-[320px] max-w-xs md:max-w-md bg-gradient-to-br ${bentoColors[colorIdx]} rounded-3xl shadow-xl border-2 border-[#2c5f63]/10 flex flex-col items-center px-6 py-8 transition-transform duration-300 hover:scale-105 relative`}>
                <img src={cocoaPodImg} alt="Cocoa Pod" className="w-16 h-16 rounded-full border-4 border-white shadow-lg absolute -top-8 left-1/2 -translate-x-1/2 bg-[#fffbe6] animate-bounce-slow" />
                <div className="pt-10 pb-2 flex flex-col items-center w-full">
                  <span className="text-base md:text-lg font-bold text-[#2c5f63] tracking-wide uppercase mb-1">{pkg.name}</span>
                  <span className="text-xl md:text-2xl font-extrabold text-[#4e3b1f] mb-2 flex items-center gap-2">
                    💰
                    {currency.symbol} {formatAmount(pkg.price)}
                  </span>
                  <span className="text-[#2c2c2c]/70 text-center text-sm md:text-base mb-2">{pkg.description}</span>
                </div>
                {/* Features */}
                <ul className="flex flex-col gap-2 w-full mb-2">
                  {features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-[#2c5f63]">
                      <span className="inline-block w-4 h-4 bg-[#b6d7b0] rounded-full mr-1" />
                      <span className="text-xs md:text-sm text-[#2c2c2c]/90">{feature}</span>
                    </li>
                  ))}
                  {features.length > 4 && (
                    <li className="text-[#2c5f63] text-xs md:text-sm font-semibold">...and more</li>
                  )}
                </ul>
                {/* Extra Perks */}
                {extraPerks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {extraPerks.slice(0, 2).map((perk, i) => (
                      <span key={i} className="bg-[#ffe066]/60 text-[#4e3b1f] text-xs font-semibold px-2 py-1 rounded-full">{perk}</span>
                    ))}
                    {extraPerks.length > 2 && <span className="text-xs text-[#4e3b1f]">...and more</span>}
                  </div>
                )}
                <Button
                  className="mt-4 w-full h-11 md:h-12 font-bold bg-[#2c5f63] hover:bg-[#1e4245] text-white shadow-lg text-base md:text-lg rounded-xl transition-all duration-300"
                  onClick={() => handlePackagePurchase(pkg)}
                >
                  <span className="flex items-center gap-2">
                    Plant My Cocoa <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            );
          }) : (
            <div className="text-center text-[#2c2c2c]/60 italic">No cocoa opportunities available at the moment.</div>
          )}
        </div>
      </section>

      {/* --- How It Works Timeline --- */}
      <section className="w-full py-10 bg-[#f8e7c1]/30 flex flex-col items-center">
        <h2 className="font-cursive text-2xl md:text-3xl text-[#2c5f63] mb-6 text-center" style={{fontFamily:'Pacifico, cursive'}}>How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center w-full max-w-4xl">
          {[
            {
              icon: <Sparkles className="w-10 h-10 text-[#ffe066]" />,
              title: "Pick a Plot",
              desc: "Choose the cocoa plot that fits your goals and budget."
            },
            {
              icon: <Shield className="w-10 h-10 text-[#2c5f63]" />,
              title: "Grow Your Farm",
              desc: "Watch your cocoa farm thrive and connect with other growers."
            },
            {
              icon: <Trophy className="w-10 h-10 text-[#b6d7b0]" />,
              title: "Harvest Rewards",
              desc: "Earn rewards as your cocoa plot flourishes."
            },
            {
              icon: <Star className="w-10 h-10 text-[#4e3b1f]" />,
              title: "Share Your Story",
              desc: "Inspire others by sharing your journey and successes."
            },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center bg-white rounded-2xl shadow-md p-6 w-64">
              {step.icon}
              <h3 className="text-lg md:text-xl font-bold text-[#2c5f63] mt-3 mb-1">{step.title}</h3>
              <p className="text-[#4e3b1f]/80 text-base">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Testimonial Section --- */}
      <section className="w-full flex flex-col items-center py-10 bg-gradient-to-br from-[#f8e7c1]/60 to-[#e6f2ef]/60">
        <div className="max-w-md bg-white/90 rounded-3xl shadow-xl flex flex-col items-center p-8 border-2 border-[#b6d7b0]/30">
          <img src={farmerImg} alt="Happy Farmer" className="w-32 h-32 rounded-full border-4 border-[#fffbe6] shadow-lg mb-4 object-cover" />
          <h2 className="font-cursive text-2xl md:text-3xl text-[#4e3b1f] mb-2 text-center" style={{fontFamily:'Pacifico, cursive'}}>Meet Amina</h2>
          <p className="text-[#4e3b1f]/80 text-base md:text-lg text-center mb-2">Amina started with just one cocoa pod. Today, her farm is thriving and her family is prospering. You can start your own journey too!</p>
          <span className="inline-block mt-4 px-4 py-2 bg-[#b6d7b0]/40 text-[#2c5f63] rounded-full font-semibold text-xs md:text-sm">Your story begins here</span>
        </div>
      </section>

   
    </div>
  );
}
