import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ContractForm } from '../components/ContractForm';
import { SignatureModal } from '../components/SignatureModal';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Edit, FileSignature as Signature, Eye } from 'lucide-react';
import type { Contract } from '@/features/core/types';

export function ContractsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch('/api/contracts');
      return response.json();
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      return response.json();
    }
  });

  const createContractMutation = useMutation({
    mutationFn: async (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create contract');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setShowNewContractModal(false);
      showToast({
        type: 'success',
        title: 'Contract created successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to create contract',
        message: error.message
      });
    }
  });

  const signContractMutation = useMutation({
    mutationFn: async ({ id, signatureData }: { id: string; signatureData: string }) => {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'signed',
          signatureData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign contract');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setShowSignatureModal(false);
      setSelectedContract(null);
      showToast({
        type: 'success',
        title: 'Contract signed successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to sign contract',
        message: error.message
      });
    }
  });

  const columns: ColumnDef<Contract>[] = [
    {
      accessorKey: 'id',
      header: 'Contract ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.id.slice(0, 8)}...
        </span>
      )
    },
    {
      accessorKey: 'propertyId',
      header: 'Property',
      cell: ({ row }) => {
        const property = properties.find((p: any) => p.id === row.original.propertyId);
        return property ? property.title : 'Unknown Property';
      }
    },
    {
      accessorKey: 'leadId',
      header: 'Client',
      cell: ({ row }) => {
        const lead = leads.find((l: any) => l.id === row.original.leadId);
        return lead ? lead.name : 'Unknown Client';
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status}>{row.original.status}</Badge>
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Could open preview modal
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {row.original.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContract(row.original);
                setShowSignatureModal(true);
              }}
            >
              <Signature className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('contracts.title')} />
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('contracts.title')}
        action={{
          label: t('contracts.newContract'),
          onClick: () => setShowNewContractModal(true),
          icon: <FileText className="h-4 w-4" />
        }}
      />

      <DataTable
        data={contracts}
        columns={columns}
        searchPlaceholder="Search contracts..."
      />

      {/* New Contract Modal */}
      <Modal
        isOpen={showNewContractModal}
        onClose={() => setShowNewContractModal(false)}
        title={t('contracts.newContract')}
        size="lg"
      >
        <ContractForm
          properties={properties}
          leads={leads}
          onSubmit={(data) => createContractMutation.mutate(data)}
          onCancel={() => setShowNewContractModal(false)}
          isLoading={createContractMutation.isPending}
        />
      </Modal>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
        onSign={(signatureData) => {
          if (selectedContract) {
            signContractMutation.mutate({
              id: selectedContract.id,
              signatureData
            });
          }
        }}
        isLoading={signContractMutation.isPending}
      />
    </div>
  );
}