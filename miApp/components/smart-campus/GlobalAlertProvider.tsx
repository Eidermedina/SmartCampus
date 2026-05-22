import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { CustomAlertProps, CustomAlert } from './CustomAlert';

export const GlobalAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<CustomAlertProps>({ visible: false, title: '', message: '' });

  useEffect(() => {
    const originalAlert = Alert.alert;

    // Monkey-patch global Alert.alert
    Alert.alert = (title: string, message?: string, buttons?: any[], options?: any) => {
      let type: CustomAlertProps['type'] = 'info';
      let onConfirm, onCancel, confirmText, cancelText;

      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('error') || lowerTitle.includes('fall') || lowerTitle.includes('no ') || lowerTitle.includes('incomplet')) {
        type = 'error';
      } else if (lowerTitle.includes('éxito') || lowerTitle.includes('enviad') || lowerTitle.includes('actualizad') || lowerTitle.includes('aceptad') || lowerTitle.includes('✓')) {
        type = 'success';
      } else if (buttons && buttons.length > 1) {
        type = 'confirm';
      } else if (lowerTitle.includes('permiso') || lowerTitle.includes('requerid') || lowerTitle.includes('límite') || lowerTitle.includes('advertencia')) {
        type = 'warning';
      }

      if (buttons && buttons.length > 0) {
        if (buttons.length === 1) {
          confirmText = buttons[0].text || 'ENTENDIDO';
          onConfirm = buttons[0].onPress;
        } else if (buttons.length >= 2) {
          // Assume first is cancel, second is confirm (common React Native pattern)
          cancelText = buttons[0].text || 'CANCELAR';
          onCancel = buttons[0].onPress;
          confirmText = buttons[1].text || 'CONFIRMAR';
          onConfirm = buttons[1].onPress;
        }
      }

      setAlertConfig({
        visible: true,
        title,
        message: message || '',
        type,
        onConfirm,
        onCancel,
        confirmText,
        cancelText
      });
    };

    return () => {
      Alert.alert = originalAlert;
    };
  }, []);

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  return (
    <>
      {children}
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
    </>
  );
};
