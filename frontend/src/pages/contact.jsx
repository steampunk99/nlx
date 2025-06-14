import ContactForm from '@/components/contact/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// 2. Import icons
import { Mail, Phone, Send } from 'lucide-react'; // Using Send for Telegram, adjust if needed

function ContactPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white py-12 md:py-20">
      <div className="container mx-auto px-4 relative z-10">
         {/* ... (Header and Form Card remain the same) ... */}
         <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
           <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
             Get In Touch
           </h1>
           <p className="text-lg md:text-xl text-neutral-400">
             Have an inquiry, or just want to say hello? We&apos;d love to hear from you.
           </p>
         </div>

         <div className="max-w-xl mx-auto">
           <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="text-2xl font-semibold text-center text-neutral-200">Send us a message</CardTitle>
             </CardHeader>
             <CardContent>
               <ContactForm />
             </CardContent>
           </Card>
         </div>

        {/* --- Icon & Flexbox Contact Info Section --- */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-neutral-500 mb-6">Or reach us directly:</p>
          {/* Flex container for contact items */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 text-neutral-400">
            {/* Telegram Item */}
            <a
              href="https://t.me/+9qsr7iCdJ-g4M2E8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-400 gap-2 hover:text-emerald-400 transition-colors group"
            >
              <Send className="w-5 h-5 text-blue-500 group-hover:text-emerald-400 transition-colors" />
              <span>Telegram Group</span>
            </a>

            {/* Phone 1 Item */}
            <a
              href="tel:+256763641452"
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
            >
              <Phone className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              <span>0763 641 452</span>
            </a>

            {/* Phone 2 Item */}
            <a
              href="tel:+256745780096"
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
            >
              <Phone className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              <span>07xxxx</span>
            </a>

            {/* Email Item */}
            <a
              href="mailto:earndrip@gmail.com"
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
            >
              <Mail className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              <span>earndrip@gmail.com</span>
            </a>
          </div>
        </div>
        {/* --- End of Icon & Flexbox Section --- */}

      </div>
    </div>
  );
}

export default ContactPage;