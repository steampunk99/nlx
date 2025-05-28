import { ArrowLeft, ChevronRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SupportPage() {
  const navigate = useNavigate ? useNavigate() : null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] p-4 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="w-full max-w-md flex items-center gap-2 mb-4">
     
        <h1 className="flex-1 text-center text-4xl font-bold text-[#4e3b1f]">EARN DRIP SUPPORT</h1>
      </div>
      {/* Online Support Button */}
     <p className="my-4 leading-3 text-md">We are here to help</p>
      {/* Telegram Section */}
      <div className="w-full max-w-md bg-[#4fa3e3]/90 rounded-xl p-5 mb-6 shadow flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="16" fill="#fff"/><path d="M23.5 9.5L19.5 23.5C19.5 23.5 19.1 24.5 18 24.5C16.9 24.5 16.7 23.5 16.7 23.5L14.5 18.5L12.5 17.5L9.5 16.5C9.5 16.5 8.5 16.1 8.5 15C8.5 13.9 9.5 13.7 9.5 13.7L22.5 9.5C22.5 9.5 23.5 9.1 23.5 9.5Z" fill="#4fa3e3"/></svg>
          <span className="text-xl font-bold text-white">Telegram</span>
        </div>
        <div className="w-full flex flex-col gap-3">
          <a href="https://t.me/+9qsr7iCdJ-g4M2E8" className="w-full bg-white text-[#4e3b1f] font-medium rounded-lg py-2 px-4 flex items-center justify-between shadow hover:bg-[#f8f8f5] transition">
            Telegram Customer Service <ChevronRight className="w-4 h-4" />
          </a>
          <a href="https://t.me/+9qsr7iCdJ-g4M2E8" className="w-full bg-white text-[#4e3b1f] font-medium rounded-lg py-2 px-4 flex items-center justify-between shadow hover:bg-[#f8f8f5] transition">
            Telegram Group <ChevronRight className="w-4 h-4" />
          </a>
          
        </div>
      </div>
      {/* Tips Section */}
      <div className="w-full max-w-md bg-[#fffbe6] rounded-xl p-5 shadow text-[#4e3b1f]">
        <h2 className="text-lg font-bold mb-2">TIPS</h2>
        <div className="text-sm">
          <p className="font-bold mb-1">Customer Service Instructions</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>If you have any questions about our platform, please contact our online customer service.</li>
            <li>If our online customer service does not respond to your message in time, please wait patiently.</li>
            <li>Do not tell your password to anyone, the official staff will not ask for your password.</li>
            <li>The official staff will not contact you actively, please pay attention.</li>
            <li>Join the Telegram group to get more money-making information.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
