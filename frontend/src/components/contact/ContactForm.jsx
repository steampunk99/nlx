import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'react-hot-toast';
// import ShimmerButton from "@/components/ui/shimmer-button"; // Optional: If you want a fancier button


function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [submitStatus, setSubmitStatus] = useState(null); // Removed unused state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // setSubmitStatus(null); // Removed unused state update

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/contact`, formData);
      
      if (response.data.success) {
        // setSubmitStatus('success'); // Removed unused state update
        toast.success(response.data.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', message: '' }); // Clear form
      } else {
        // setSubmitStatus('error'); // Removed unused state update
        toast.error(response.data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      // setSubmitStatus('error'); // Removed unused state update
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again later.';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        console.error("Validation Errors:", error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-stone-700">Name</Label>
          <Input 
            id="name" 
            name="name"
            type="text" 
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleChange}
            required 
            className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-600/20 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="janedoe@gmail.com" 
            value={formData.email}
            onChange={handleChange}
            required 
            className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-600/20 focus:outline-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-stone-700">Message</Label>
        <Textarea 
          id="message" 
          name="message"
          placeholder="How can we help you?" 
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-600/20 focus:outline-none"
        />
      </div>
      <div className="flex justify-end pt-4">
         <Button 
           type="submit" 
           disabled={isSubmitting}
           className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-md transition duration-200 w-full sm:w-auto disabled:opacity-50"
         >
           {isSubmitting ? 'Sending...' : 'Send Message'}
         </Button>
      </div>
    </form>
  );
}

export default ContactForm; 