import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Package, Users, DollarSign, Activity } from 'lucide-react';
import { useAdminPackages } from '../../../hooks/useAdminPackages';
import { PackageList } from '../../../components/admin/packages/PackageList';
import { motion } from 'framer-motion';

// Format currency in UGX
const formatCurrency = (amount) => {
  const value = Number(amount);
  if (!amount || isNaN(value)) return "UGX 0";
  return `UGX ${value.toLocaleString('en-US')}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function AdminPackages() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminPackages().usePackageStats();

  const statCards = [
    {
      title: "Total Packages",
      value: stats?.totalPackages || 0,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Active Packages",
      value: stats?.activePackages || 0,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Package Management</h1>
        <Button 
          onClick={() => navigate('create')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <PackageList />
    </div>
  );
}
