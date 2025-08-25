import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trash2, PenTool } from 'lucide-react';
import type { Contract } from '@/features/core/types';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSign: (signatureData: string) => void;
  isLoading?: boolean;
}

export function SignatureModal({ isOpen, onClose, contract, onSign, isLoading }: SignatureModalProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onSign(signatureData);
  };

  if (!contract) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('contracts.sign')}
      size="xl"
    >
      <div className="space-y-6">
        {/* Contract Preview */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Contract Preview
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
            {Object.entries(contract.variables).reduce(
              (template, [key, value]) => template.replace(new RegExp(`{{${key}}}`, 'g'), value),
              contract.template
            )}
          </div>
        </div>

        {/* Signature Pad */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              {t('contracts.signHere')}
            </h4>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('contracts.clearSignature')}
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Click and drag to sign
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSign}
            disabled={!hasSignature}
            loading={isLoading}
            className="min-w-[120px]"
          >
            {t('contracts.sign')}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}