import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import { Icon } from '../../../../node_modules/@iconify/react'

const faqCategories = [
  {
    id: 1,
    name: "Getting Started",
    icon: "ph:rocket-launch-bold",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "To create an account, click on the 'Register' button in the top right corner of the homepage. Fill in your details including name, email, and password. Follow the verification process sent to your email to activate your account.",
        views: 1250
      },
      {
        question: "What documents do I need for verification?",
        answer: "For account verification, you'll need to provide: 1) A valid government-issued ID (passport, driver's license), 2) Proof of address (utility bill, bank statement not older than 3 months), 3) A clear selfie holding your ID.",
        views: 890
      }
    ]
  },
  {
    id: 2,
    name: "Investments",
    icon: "ph:chart-line-up-bold",
    faqs: [
      {
        question: "What are the minimum and maximum investment amounts?",
        answer: "Investment limits vary by package. The Basic Starter package begins at $100, while our Enterprise Elite package can accommodate investments up to $100,000. Each package has its own specific investment range.",
        views: 2100
      },
      {
        question: "How are returns calculated and distributed?",
        answer: "Returns are calculated based on your chosen investment package and duration. They are distributed according to the payment schedule specified in your package (daily, weekly, or monthly) directly to your account balance.",
        views: 1800
      }
    ]
  },
  {
    id: 3,
    name: "Withdrawals",
    icon: "ph:money-bold",
    faqs: [
      {
        question: "How long do withdrawals take to process?",
        answer: "Withdrawal processing times vary by method: Bank transfers (2-3 business days), Crypto (1-24 hours), PayPal (24-48 hours). All withdrawals are subject to security verification.",
        views: 3200
      },
      {
        question: "What are the withdrawal fees?",
        answer: "Withdrawal fees depend on your chosen method. Bank transfers (1.5%), Crypto (0.5%), PayPal (2.5%). Premium members enjoy reduced fees across all withdrawal methods.",
        views: 2800
      }
    ]
  },
  {
    id: 4,
    name: "Referral Program",
    icon: "ph:users-three-bold",
    faqs: [
      {
        question: "How does the referral program work?",
        answer: "Our referral program offers multi-level commissions: Direct referrals (5%), Secondary referrals (2%), Tertiary referrals (1%). Commissions are paid instantly when your referrals make investments.",
        views: 1500
      },
      {
        question: "When are referral commissions paid?",
        answer: "Referral commissions are paid automatically when your referral makes a qualified investment. The commission is instantly credited to your account balance and can be withdrawn according to our standard withdrawal policies.",
        views: 1200
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-sm text-gray-500">Manage frequently asked questions and categories</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:plus-bold" className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
            <Icon icon="ph:question-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">Across 4 categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Icon icon="ph:eye-bold" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.7K</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Icon icon="ph:folders-bold" className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-gray-500">Active categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Viewed</CardTitle>
            <Icon icon="ph:chart-bar-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2K</div>
            <p className="text-xs text-gray-500">Withdrawals FAQ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {faqCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon={category.icon} className="h-5 w-5 text-gray-500" />
                  <CardTitle>{category.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon">
                  <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {category.faqs.length} frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span>{faq.question}</span>
                        <span className="text-xs text-gray-500">({faq.views} views)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon icon="ph:pencil-bold" className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Icon icon="ph:trash-bold" className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
