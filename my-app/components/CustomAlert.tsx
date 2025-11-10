
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  visible: boolean;
  onDismiss: () => void;
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

const CustomAlert: React.FC<AlertProps> = ({ title, message, buttons = [], visible, onDismiss }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const defaultButtons: AlertButton[] = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onDismiss }];

  const handleButtonPress = (button: AlertButton) => {
    onDismiss();
    if (button.onPress) {
      setTimeout(() => {
        button.onPress!();
      }, 50);
    }
  };

  const getButtonStyle = (button: AlertButton) => {
    switch (button.style) {
      case 'destructive':
        return { color: '#E74C3C' };
      case 'cancel':
        return { color: '#95A5A6' };
      default:
        return { color: tintColor };
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <ThemedView style={[styles.alertContainer, { backgroundColor }]}>
          <View style={styles.contentContainer}>
            <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
              {title}
            </ThemedText>
            {message && (
              <ThemedText style={[styles.message, { color: textColor }]}>
                {message}
              </ThemedText>
            )}
          </View>

          <View style={styles.buttonContainer}>
            {defaultButtons.map((button, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.button,
                  index < defaultButtons.length - 1 && styles.buttonBorder,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleButtonPress(button)}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.buttonText, getButtonStyle(button)]}
                >
                  {button.text}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as AlertButton[],
  });

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertState({
      visible: true,
      title,
      message: message || '',
      buttons: buttons || [],
    });
  };

  const hideAlert = () => {
    setAlertState({
      visible: false,
      title: '',
      message: '',
      buttons: [],
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        visible={alertState.visible}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: Math.min(width - 40, 280),
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E0E0E0',
  },
  buttonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default CustomAlert;
