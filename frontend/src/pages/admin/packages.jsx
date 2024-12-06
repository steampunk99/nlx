import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { usePackages } from '../../hooks/usePackages';
import { useAdminPackages } from '../../hooks/useAdminPackages';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Users, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { PackageForm } from '../../components/admin/packages/PackageForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

// Format currency in UGX
const formatCurrency = (amount) => {
  const value = Number(amount);
  if (!amount || isNaN(value)) return "UGX 0";
  return `UGX ${value.toLocaleString('en-US')}`;
};

export function AdminPackagesPage() {
  const navigate = useNavigate();
  const { data: packages, isLoading } = usePackages();
  const { data: stats } = useAdminPackages().usePackageStats();
  const { togglePackageStatus, deletePackage, createPackage, updatePackage } = useAdminPackages();
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async () => {
    if (packageToDelete) {
      await deletePackage.mutateAsync(packageToDelete.id);
      setPackageToDelete(null);
    }
  };

  const handleCreateSubmit = async (data) => {
    await createPackage.mutateAsync(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditSubmit = async (data) => {
    await updatePackage.mutateAsync({
      id: editingPackage.id,
      data
    });
    setEditingPackage(null);
  };

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

  const filteredPackages = useMemo(() => {
    if (!packages) return [];
    return packages.filter(pkg => 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [packages, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Package className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Package Management</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Package
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Package List */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold">Existing Packages</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Manage and view your current investment packages
              </CardDescription>
            </div>
            <input 
              type="text" 
              placeholder="Search packages..." 
              className="input input-bordered w-full max-w-xs border rounded-md px-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Description</th>
                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Price</th>
                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Level</th>
                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-2">{pkg.name}</td>
                  <td className="px-4 py-2">{pkg.description}</td>
                  <td className="px-4 py-2">{formatCurrency(pkg.price)}</td>
                  <td className="px-4 py-2">
                    <Badge 
                      variant={pkg.level === 4 ? 'default' : 'secondary'}
                      className="px-2 py-1 rounded-full text-xs"
                    >
                      Level {pkg.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Switch 
                      checked={pkg.status === 'ACTIVE'}
                      onCheckedChange={() => togglePackageStatus.mutate(pkg.id)}
                    />
                  </td>
                  <td className="px-4 py-2 flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setEditingPackage(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setPackageToDelete(pkg)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Package Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
          </DialogHeader>
          <PackageForm 
            onSubmit={handleCreateSubmit} 
            initialData={null} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <PackageForm 
            onSubmit={handleEditSubmit} 
            initialData={editingPackage} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!packageToDelete} onOpenChange={() => setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the package "{packageToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminPackagesPage;
