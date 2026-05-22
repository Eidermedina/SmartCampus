import { useState } from 'react';
import { CustomAlert, CustomAlertProps } from '@/components/smart-campus/CustomAlert';

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<CustomAlertProps>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (
    title: string, 
    message: string, 
    type: CustomAlertProps['type'] = 'info', 
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm, onCancel, confirmText, cancelText });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => {
    return (
      <CustomAlert
        {...alertConfig}
        onClose={closeAlert}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          closeAlert();
        }}
        onCancel={() => {
          if (alertConfig.onCancel) alertConfig.onCancel();
          closeAlert();
        }}
      />
    );
  };

  return { showAlert, closeAlert, alertConfig, setAlertConfig, AlertComponent };
}
