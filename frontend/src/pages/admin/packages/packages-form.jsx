import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminPackages } from '@/hooks/admin/useAdminPackages';
import { Loader2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';

// Form validation schema
const packageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.string().refine(
    (val) => !isNaN(val) && parseFloat(val) > 0,
    'Price must be a positive number'
  ),
  level: z.string().refine(
    (val) => !isNaN(val) && parseInt(val) > 0,
    'Level must be a positive number'
  ),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  benefits: z.string().optional(),
  maxNodes: z.string()
    .refine(
      (val) => !val || (!isNaN(val) && parseInt(val) > 0),
      'Max nodes must be a positive number'
    )
    .optional(),
  duration: z.string()
    .refine(
      (val) => !val || (!isNaN(val) && parseInt(val) > 0),
      'Duration must be a positive number'
    )
    .optional(),
  features: z.string().optional(),
  dailyMultiplier: z.string()
    .refine(
      (val) => !val || (!isNaN(val) && parseFloat(val) > 0),
      'Daily multiplier must be a positive number'
    )
    .optional()
});

const PackageForm = ({ packageData, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPackage, updatePackage } = useAdminPackages();

  const form = useForm({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: packageData?.name || '',
      description: packageData?.description || '',
      price: packageData?.price?.toString() || '',
      level: packageData?.level?.toString() || '',
      status: packageData?.status || 'ACTIVE',
      benefits: packageData?.benefits ? JSON.stringify(packageData.benefits, null, 2) : '',
      maxNodes: packageData?.maxNodes?.toString() || '',
      duration: packageData?.duration?.toString() || '',
      features: packageData?.features || '',
      dailyMultiplier: packageData?.dailyMultiplier?.toString() || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Parse benefits JSON if provided
      let parsedBenefits = null;
      if (data.benefits) {
        try {
          parsedBenefits = JSON.parse(data.benefits);
        } catch (e) {
          form.setError('benefits', {
            type: 'manual',
            message: 'Invalid JSON format'
          });
          return;
        }
      }

      const packagePayload = {
        ...data,
        benefits: parsedBenefits
      };

      if (packageData?.id) {
        await updatePackage.mutateAsync({
          id: packageData.id,
          data: packagePayload
        });
      } else {
        await createPackage.mutateAsync(packagePayload);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Package form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="features">Features & Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter package name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter package description"
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter level"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxNodes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Nodes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter max nodes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter duration"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dailyMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Multiplier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter daily multiplier"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter package features"
                          className="resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter benefits in JSON format"
                          className="resize-none font-mono h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {packageData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            packageData ? 'Update Package' : 'Create Package'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PackageForm;
