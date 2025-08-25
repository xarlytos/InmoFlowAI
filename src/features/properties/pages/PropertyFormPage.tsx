import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { PropertyForm } from '../components/PropertyForm';
import { propertySchema, type PropertyFormData } from '../schemas/property';
import { useToast } from '@/components/ui/Toast';
import type { Property } from '@/features/core/types';

export function PropertyFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const { data: property, isLoading } = useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      return response.json();
    },
    enabled: isEditing
  });

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      ref: '',
      title: '',
      description: '',
      price: 0,
      currency: 'EUR',
      status: 'draft',
      type: 'flat',
      address: {
        street: '',
        city: '',
        country: 'España'
      },
      features: {
        rooms: 1,
        baths: 1,
        area: 50
      },
      media: [],
      tags: []
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create property');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      showToast({
        type: 'success',
        title: 'Property created successfully'
      });
      navigate('/properties');
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to create property',
        message: error.message
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update property');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      showToast({
        type: 'success',
        title: 'Property updated successfully'
      });
      navigate('/properties');
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to update property',
        message: error.message
      });
    }
  });

  useEffect(() => {
    if (property && isEditing) {
      form.reset(property);
    }
  }, [property, isEditing, form]);

  const onSubmit = (data: PropertyFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." />
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditing ? 'Edit Property' : t('properties.newProperty')}
      />

      <PropertyForm
        form={form}
        onSubmit={onSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => navigate('/properties')}
      />
    </div>
  );
}