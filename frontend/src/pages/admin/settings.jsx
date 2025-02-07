import { useState } from 'react';
import { useAdmin } from '@/hooks/admin/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';

export default function AdminSettingsPage() {
    const { useAdminConfig, useUpdateAdminConfig } = useAdmin();
    const { data: config, isLoading } = useAdminConfig();
    const { mutate: updateConfig, isLoading: isUpdating } = useUpdateAdminConfig();

    const [formData, setFormData] = useState(config || {});
    const [imageLoadError, setImageLoadError] = useState({
        logo: false,
        promo: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateConfig(formData);
    };

    const handleImageError = (type) => {
        setImageLoadError(prev => ({
            ...prev,
            [type]: true
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">System Settings</h1>
                <Button onClick={handleSubmit} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Site Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Site Information</CardTitle>
                        <CardDescription>Basic information about your site</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="siteName">Site Name</Label>
                                <Input
                                    id="siteName"
                                    name="siteName"
                                    value={formData.siteName || ''}
                                    onChange={handleChange}
                                    placeholder="earndrip.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteBaseUrl">Base URL</Label>
                                <Input
                                    id="siteBaseUrl"
                                    name="siteBaseUrl"
                                    value={formData.siteBaseUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://earndrip.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>Site Logo</Label>
                                <div className="p-4 border rounded-lg bg-muted/10">
                                    <div className="flex flex-col items-center gap-4">
                                        {formData.siteLogoUrl && !imageLoadError.logo && (
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-lg border bg-white flex items-center justify-center">
                                                    <img 
                                                        src={formData.siteLogoUrl} 
                                                        alt="Site Logo" 
                                                        className="w-full h-full object-contain rounded-lg"
                                                        onError={() => handleImageError('logo')}
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        className="text-white text-sm hover:underline"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, siteLogoUrl: null }));
                                                            setImageLoadError(prev => ({ ...prev, logo: false }));
                                                        }}
                                                    >
                                                        Remove Logo
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <ImageUpload 
                                            onImageSelected={(path) => {
                                                setImageLoadError(prev => ({ ...prev, logo: false }));
                                                setFormData(prev => ({
                                                    ...prev,
                                                    siteLogoUrl: path
                                                }));
                                            }}
                                        />
                                        <p className="text-sm text-muted-foreground text-center">
                                            Upload a square logo (PNG or SVG recommended).<br/>
                                            Max size: 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Image Upload */}
                            <div className="space-y-2">
                                <Label>Promotional Image</Label>
                                <div className="p-4 border rounded-lg bg-muted/10">
                                    <div className="flex flex-col items-center gap-4">
                                        {formData.promoImageUrl && !imageLoadError.promo && (
                                            <div className="relative group">
                                                <div className="w-full h-32 rounded-lg border bg-white flex items-center justify-center">
                                                    <img 
                                                        src={formData.promoImageUrl} 
                                                        alt="Promotional" 
                                                        className="w-full h-full object-cover rounded-lg"
                                                        onError={() => handleImageError('promo')}
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        className="text-white text-sm hover:underline"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, promoImageUrl: null }));
                                                            setImageLoadError(prev => ({ ...prev, promo: false }));
                                                        }}
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <ImageUpload 
                                            onImageSelected={(path) => {
                                                setImageLoadError(prev => ({ ...prev, promo: false }));
                                                setFormData(prev => ({
                                                    ...prev,
                                                    promoImageUrl: path
                                                }));
                                            }}
                                        />
                                        <p className="text-sm text-muted-foreground text-center">
                                            Upload a promotional banner image.<br/>
                                            Recommended size: 1200x400px
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Collection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Collection</CardTitle>
                        <CardDescription>Mobile money collection numbers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mtnCollectionNumber">MTN Collection Number</Label>
                                <Input
                                    id="mtnCollectionNumber"
                                    name="mtnCollectionNumber"
                                    value={formData.mtnCollectionNumber || ''}
                                    onChange={handleChange}
                                    placeholder="+256 XXX XXX XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="airtelCollectionNumber">Airtel Collection Number</Label>
                                <Input
                                    id="airtelCollectionNumber"
                                    name="airtelCollectionNumber"
                                    value={formData.airtelCollectionNumber || ''}
                                    onChange={handleChange}
                                    placeholder="+256 XXX XXX XXX"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Support Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Support Information</CardTitle>
                        <CardDescription>Contact details for customer support</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="supportPhone">Support Phone</Label>
                                <Input
                                    id="supportPhone"
                                    name="supportPhone"
                                    value={formData.supportPhone || ''}
                                    onChange={handleChange}
                                    placeholder="+256 XXX XXX XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supportEmail">Support Email</Label>
                                <Input
                                    id="supportEmail"
                                    name="supportEmail"
                                    value={formData.supportEmail || ''}
                                    onChange={handleChange}
                                    placeholder="support@example.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportLocation">Support Location</Label>
                            <Input
                                id="supportLocation"
                                name="supportLocation"
                                value={formData.supportLocation || ''}
                                onChange={handleChange}
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Currency Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Currency Settings</CardTitle>
                        <CardDescription>Exchange rates and withdrawal charges</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="depositDollarRate">Deposit Rate (UGX/USD)</Label>
                                <Input
                                    id="depositDollarRate"
                                    name="depositDollarRate"
                                    type="number"
                                    value={formData.depositDollarRate || ''}
                                    onChange={handleChange}
                                    placeholder="3900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="withdrawalDollarRate">Withdrawal Rate (UGX/USD)</Label>
                                <Input
                                    id="withdrawalDollarRate"
                                    name="withdrawalDollarRate"
                                    type="number"
                                    value={formData.withdrawalDollarRate || ''}
                                    onChange={handleChange}
                                    placeholder="3900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="withdrawalCharge">Withdrawal Charge (%)</Label>
                                <Input
                                    id="withdrawalCharge"
                                    name="withdrawalCharge"
                                    type="number"
                                    step="0.01"
                                    value={formData.withdrawalCharge || ''}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* USDT Wallet */}
                <Card>
                    <CardHeader>
                        <CardTitle>USDT Wallet</CardTitle>
                        <CardDescription>USDT wallet address for payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="usdtWalletAddress">USDT Wallet Address</Label>
                            <Input
                                id="usdtWalletAddress"
                                name="usdtWalletAddress"
                                value={formData.usdtWalletAddress || ''}
                                onChange={handleChange}
                                placeholder="Enter USDT wallet address"
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
