export interface CompanyConfirmModalProps {
  suggestions: string[];
  originalInput: string;
  onConfirm: (companyName: string) => void;
  onManualInput: () => void;
  onClose: () => void;
  confirmLabel?: string;
}
