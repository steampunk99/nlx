"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, Trophy } from "lucide-react"
import { usePackages } from "@/hooks/payments/usePackages"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { useNavigate } from "react-router-dom"
import { BorderTrail } from "@/components/ui/border-trail"
import { useCountry } from "@/hooks/config/useCountry"
import ReactCountryFlag from "react-country-flag"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
  hover: {
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
}

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
        <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 1440 520" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex:1}} preserveAspectRatio="none">
          <rect width="1440" height="520" fill="#e6f2ef"/>
          <ellipse cx="200" cy="480" rx="180" ry="60" fill="#b6d7b0"/>
          <ellipse cx="1240" cy="500" rx="200" ry="70" fill="#f8e7c1"/>
          <ellipse cx="720" cy="510" rx="400" ry="80" fill="#b6d7b0"/>
          {/* Sun with rays */}
          <g>
            <circle cx="180" cy="100" r="60" fill="#ffe066">
              <animate attributeName="cy" values="100;90;100" dur="4s" repeatCount="indefinite"/>
            </circle>
            {[...Array(12)].map((_,i) => (
              <rect key={i} x={180+Math.cos((i/12)*2*Math.PI)*80-2} y={100+Math.sin((i/12)*2*Math.PI)*80-12} width="4" height="24" rx="2" fill="#ffe066" opacity="0.5" transform={`rotate(${i*30} 180 100)`}/>
            ))}
          </g>
          {/* Multiple cocoa trees and pods */}
          {[320, 1120, 600, 900].map((x, i) => (
            <g key={x}>
              <rect x={x} y={350} width="16" height="60" rx="7" fill="#8d6748"/>
              <ellipse cx={x+8} cy={350} rx="28" ry="18" fill="#4e7c3a"/>
              <ellipse cx={x+8} cy={350} rx="14" ry="9" fill="#7bb661"/>
              <ellipse cx={x+18} cy={370} rx="5" ry="10" fill="#c97c3a"/>
            </g>
          ))}
          {/* Animated clouds */}
          <ellipse cx="600" cy="90" rx="60" ry="20" fill="#fff" opacity="0.7">
            <animate attributeName="cx" values="600;900;600" dur="12s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="900" cy="60" rx="40" ry="14" fill="#fff" opacity="0.5">
            <animate attributeName="cx" values="900;600;900" dur="14s" repeatCount="indefinite"/>
          </ellipse>
          {/* Decorative hills */}
          <ellipse cx="400" cy="500" rx="120" ry="40" fill="#b6d7b0"/>
          <ellipse cx="1040" cy="520" rx="140" ry="50" fill="#e6f2ef"/>
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h1 className="font-cursive text-5xl md:text-7xl text-[#4e3b1f] drop-shadow-lg mb-4 tracking-tight text-center" style={{fontFamily:'Pacifico, cursive'}}>Grow Your Cocoa Dream</h1>
          <p className="text-xl md:text-2xl text-[#2c2c2c]/80 font-medium max-w-2xl text-center mb-6 drop-shadow-sm">
            Choose a cocoa opportunity and start your journey to a fruitful harvest.
          </p>
          <img src={cocoaPodImg} alt="Cocoa Pod" className="w-24 h-24 rounded-full border-4 border-[#fffbe6] shadow-xl animate-bounce-slow" />
        </div>
      </div>

      {/* Step-by-step Visual Guide */}
      <div className="w-full flex flex-col items-center py-8 bg-[#f8f8f5]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {[
            { icon: '🌱', label: 'Pick a Plot' },
            { icon: '🌰', label: 'Plant Cocoa' },
            { icon: '🌿', label: 'Watch it Grow' },
            { icon: '🍫', label: 'Harvest Rewards' },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl mb-2 animate-bounce-slow" style={{animationDelay: `${idx * 0.2}s`}}>{step.icon}</div>
              <span className="text-lg font-bold text-[#4e3b1f] font-cursive" style={{fontFamily:'Pacifico, cursive'}}>{step.label}</span>
              {idx < 3 && <span className="hidden md:inline-block mx-4 text-2xl text-[#b6d7b0]">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Redesigned Bento Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 bento-grid">
        {/* Left: Farmer Visual & Story */}
        <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center bg-gradient-to-br from-[#f8e7c1] to-[#e6f2ef] rounded-3xl shadow-lg p-8 relative overflow-hidden min-h-[340px]">
          <img src={farmerImg} alt="Happy Farmer" className="w-28 h-28 rounded-full border-4 border-[#fffbe6] shadow-lg mb-4 object-cover" />
          <h2 className="font-cursive text-2xl md:text-3xl text-[#4e3b1f] mb-2 text-center" style={{fontFamily:'Pacifico, cursive'}}>Meet Amina</h2>
          <p className="text-[#4e3b1f]/80 text-base md:text-lg text-center mb-2">Amina started with just one cocoa pod. Today, her farm is thriving and her family is prospering. You can start your own journey too!</p>
          <span className="inline-block mt-4 px-4 py-2 bg-[#b6d7b0]/40 text-[#2c5f63] rounded-full font-semibold text-xs md:text-sm">Your story begins here</span>
        </div>

        {/* Center: Cocoa Opportunities (Cards) */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-8 items-center">
          <h3 className="font-cursive text-xl md:text-2xl text-[#4e3b1f] mb-4 text-center" style={{fontFamily:'Pacifico, cursive'}}>Pick Your Cocoa Plot</h3>
          <div className="flex flex-col gap-8 w-full">
            {availablePackages.length > 0 ? availablePackages.map((pkg, idx) => {
              let features = Array.isArray(pkg.features) ? pkg.features : [];
              let extraPerks = Array.isArray(pkg.extraPerks) ? pkg.extraPerks : [];
              const maxFeatures = 4;
              const maxPerks = 2;
              const visibleFeatures = features.slice(0, maxFeatures);
              const hasMoreFeatures = features.length > maxFeatures;
              const visiblePerks = extraPerks.slice(0, maxPerks);
              const hasMorePerks = extraPerks.length > maxPerks;
              const colorIdx = idx % bentoColors.length;
              return (
                <div key={pkg.id || idx} className={`relative rounded-3xl shadow-xl border-2 border-[#2c5f63]/20 bg-gradient-to-br ${bentoColors[colorIdx]} overflow-hidden flex flex-col items-center px-6 py-8 transition-transform duration-300 hover:scale-105 min-h-[320px]`}> 
                  {/* Animated cocoa pod */}
                  <img src={cocoaPodImg} alt="Cocoa Pod" className="w-16 h-16 rounded-full border-4 border-white shadow-lg absolute -top-8 mt-8 left-1/2 -translate-x-1/2 bg-[#fffbe6] animate-bounce-slow" />
                  <div className="pt-10 pb-2 flex flex-col items-center w-full">
                    <span className="text-base md:text-lg font-bold text-[#2c5f63] tracking-wide uppercase mb-1">{pkg.name}</span>
                    <span className="text-xl md:text-2xl font-extrabold text-[#4e3b1f] mb-2 flex items-center gap-2">
                      <ReactCountryFlag countryCode={country} svg className="rounded shadow-sm w-6 h-6" />
                      {currency.symbol} {formatAmount(pkg.price)}
                    </span>
                    <span className="text-[#2c2c2c]/70 text-center text-sm md:text-base mb-2">{pkg.description}</span>
                  </div>
                  {/* Features */}
                  <ul className="flex flex-col gap-2 w-full mb-2">
                    {visibleFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-[#2c5f63]">
                        <span className="inline-block w-4 h-4 bg-[#b6d7b0] rounded-full mr-1" />
                        <span className="text-xs md:text-sm text-[#2c2c2c]/90">{feature}</span>
                      </li>
                    ))}
                    {hasMoreFeatures && (
                      <li className="text-[#2c5f63] text-xs md:text-sm font-semibold">...and more</li>
                    )}
                  </ul>
                  {/* Extra perks */}
                  {visiblePerks.length > 0 && (
                    <div className="w-full mb-2">
                      <span className="font-semibold text-[#4e3b1f] text-xs md:text-sm">Extra Perks:</span>
                      <ul className="flex flex-col gap-1 mt-1">
                        {visiblePerks.map((perk, i) => (
                          <li key={i} className="flex items-center gap-2 text-[#2c5f63]">
                            <span className="inline-block w-3 h-3 bg-[#ffe066] rounded-full mr-1" />
                            <span className="text-xs md:text-sm text-[#2c2c2c]/80">{perk}</span>
                          </li>
                        ))}
                        {hasMorePerks && (
                          <li className="text-[#2c5f63] text-xs font-semibold">...and more</li>
                        )}
                      </ul>
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
        </div>

        {/* Right: Fun Cocoa Facts & Visuals */}
        <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center bg-gradient-to-br from-[#b6d7b0] to-[#f8e7c1] rounded-3xl shadow-lg p-8 relative overflow-hidden min-h-[340px]">
          <h2 className="font-cursive text-2xl md:text-3xl text-[#4e3b1f] mb-2 text-center" style={{fontFamily:'Pacifico, cursive'}}>Did You Know?</h2>
          <ul className="text-[#4e3b1f]/80 text-base md:text-lg list-disc pl-6 space-y-2 mb-4">
            <li>Cocoa trees can live up to 100 years, but produce marketable pods for only 25 years.</li>
            <li>Each cocoa pod contains 20-50 beans—enough to make several chocolate bars!</li>
            <li>West Africa produces about 70% of the world's cocoa.</li>
          </ul>
          <img src={cocoaPodImg} alt="Cocoa Beans" className="w-24 h-24 rounded-2xl border-4 border-[#fffbe6] shadow-lg object-cover" />
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="w-full py-12 flex flex-col items-center justify-center bg-gradient-to-br from-[#b6d7b0]/40 to-[#f8e7c1]/40">
        <h2 className="font-cursive text-3xl md:text-4xl text-[#4e3b1f] mb-4 text-center" style={{fontFamily:'Pacifico, cursive'}}>Ready to Plant Your Future?</h2>
        <p className="text-lg md:text-xl text-[#2c2c2c]/80 max-w-2xl text-center mb-8">Join a thriving community of cocoa growers and start your journey to a bountiful harvest today.</p>
        <Button
          size="lg"
          className="bg-[#2c5f63] hover:bg-[#1e4245] text-white shadow-lg text-lg md:text-xl font-bold rounded-2xl px-8 py-4"
          onClick={() => document.querySelector('.bento-grid').scrollIntoView({ behavior: 'smooth' })}
        >
          Explore Cocoa Opportunities <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* FAQ Section - Minimalist, Polished */}
      <section className="max-w-3xl mx-auto py-12 px-4">
        <h2 className="font-cursive text-2xl md:text-3xl text-[#2c5f63] mb-6 text-center" style={{fontFamily:'Pacifico, cursive'}}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              question: "How do I join a cocoa opportunity?",
              answer: "Simply select your preferred cocoa plot above and follow the steps to activate your account."
            },
            {
              question: "How do I earn rewards?",
              answer: "You earn as your cocoa plot grows and as you refer others to join the journey."
            },
            {
              question: "Is this a one-time payment?",
              answer: "Yes, all cocoa opportunities are a one-time payment for lifetime access."
            },
            {
              question: "How do I get paid?",
              answer: "Rewards are credited to your account and can be withdrawn through supported payment methods."
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-[#e6f2ef]">
              <h3 className="text-lg md:text-xl font-semibold text-[#2c5f63] mb-2 font-cursive" style={{fontFamily:'Pacifico, cursive'}}>{faq.question}</h3>
              <p className="text-[#2c2c2c]/80 text-base md:text-lg">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
