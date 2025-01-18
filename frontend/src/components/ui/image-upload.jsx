import { useState } from 'react';
import { Button } from './button';
import { Loader2, Upload } from 'lucide-react';
import { api } from '@/lib/axios';

export function ImageUpload({ onImageSelected, className }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload the file
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.status !== 'success') {
        throw new Error(response.data?.message || 'Upload failed');
      }
      
      onImageSelected(response.data.data.path);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="relative"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageChange}
            accept="image/*"
          />
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Upload Image
        </Button>
      </div>
      
      {preview && (
        <div className="mt-4">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-[200px] rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
