import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Icon } from '../../../iconify/react'

const articles = [
  {
    id: "KB001",
    title: "Complete Guide to Investment Packages",
    category: "Investments",
    author: "John Smith",
    status: "published",
    views: 1250,
    lastUpdate: "2024-01-20"
  },
  {
    id: "KB002",
    title: "Understanding the Referral System",
    category: "Referrals",
    author: "Jane Doe",
    status: "draft",
    views: 0,
    lastUpdate: "2024-01-19"
  },
  {
    id: "KB003",
    title: "Withdrawal Methods and Processing Times",
    category: "Payments",
    author: "Mike Johnson",
    status: "published",
    views: 890,
    lastUpdate: "2024-01-18"
  },
  {
    id: "KB004",
    title: "Account Security Best Practices",
    category: "Security",
    author: "Sarah Wilson",
    status: "review",
    views: 0,
    lastUpdate: "2024-01-17"
  }
]

const categories = [
  {
    name: "Investments",
    articles: 15,
    views: 12500
  },
  {
    name: "Payments",
    articles: 12,
    views: 9800
  },
  {
    name: "Security",
    articles: 8,
    views: 7200
  },
  {
    name: "Referrals",
    articles: 6,
    views: 5400
  }
]

const statusColors = {
  published: "bg-green-50 text-green-700",
  draft: "bg-gray-50 text-gray-700",
  review: "bg-yellow-50 text-yellow-700"
}

export default function KnowledgeBasePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-gray-500">Manage knowledge base articles and categories</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="investments">Investments</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="referrals">Referrals</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Icon icon="ph:plus-bold" className="h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Icon icon="ph:book-open-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">41</div>
            <p className="text-xs text-gray-500">+3 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Icon icon="ph:eye-bold" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.9K</div>
            <p className="text-xs text-gray-500">+2.4K this month</p>
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
            <CardTitle className="text-sm font-medium">Authors</CardTitle>
            <Icon icon="ph:users-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">Contributing writers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>
              Latest knowledge base articles and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>{article.views}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[article.status]
                      }`}>
                        {article.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Icon icon="ph:eye-bold" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories Overview</CardTitle>
            <CardDescription>
              Knowledge base categories and their statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.name}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.articles}</TableCell>
                    <TableCell>{category.views}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Icon icon="ph:list-bold" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
