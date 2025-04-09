import ContactForm from '@/components/contact/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ContactPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white py-12 md:py-20">
      <div className="container mx-auto px-4 relative z-10">
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

        <div className="text-center mt-12 md:mt-16 text-neutral-500">
          <p>You can also reach us at: <a href="mailto:earndrip@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline">earndrip@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage; 