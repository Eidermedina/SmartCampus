import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ 
  visible, title, message, type = 'info', onClose, onConfirm, onCancel, confirmText = 'ENTENDIDO', cancelText = 'CANCELAR' 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  let icon = 'information-circle';
  let iconColor = colors.primary;

  if (type === 'success') {
    icon = 'checkmark-circle';
    iconColor = colors.success;
  } else if (type === 'error') {
    icon = 'close-circle';
    iconColor = colors.error;
  } else if (type === 'warning' || type === 'confirm') {
    icon = 'warning';
    iconColor = '#FFD60A';
  }

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 28, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${iconColor}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name={icon as any} size={48} color={iconColor} />
          </View>
          <ThemedText style={{ fontSize: 22, fontWeight: '900', marginBottom: 12, textAlign: 'center' }}>{title}</ThemedText>
          <ThemedText style={{ fontSize: 15, color: '#8E8E93', textAlign: 'center', marginBottom: 32, lineHeight: 22, fontWeight: '500' }}>{message}</ThemedText>
          
          {type === 'confirm' ? (
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 16, borderRadius: 100, alignItems: 'center', backgroundColor: isLight ? '#F2F2F7' : '#1C1C1E' }}
                onPress={handleCancel}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>{cancelText}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: iconColor, paddingVertical: 16, borderRadius: 100, alignItems: 'center' }}
                onPress={handleConfirm}
              >
                <ThemedText style={{ color: isLight ? '#000' : '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>{confirmText}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: iconColor, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 100, width: '100%', alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <ThemedText style={{ color: (isLight && type === 'warning') ? '#000' : '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>{confirmText}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
