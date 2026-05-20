import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRole, UserRole } from '@/hooks/useRole';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../themed-text';
import { API_URL } from '@/constants/Config';

const { width, height } = Dimensions.get('window');

export const Auth: React.FC = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { setRole, setUserName, setUserMajor, login } = useRole();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identification, setIdentification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [isMajorModalVisible, setIsMajorModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!email || !password || (activeTab === 'register' && (!firstName || !lastName || !identification || !selectedMajor))) {
      setError('Por favor completa todos los campos.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      if (activeTab === 'register') {
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('identification_number', identification);
        formData.append('role', selectedRole);
        formData.append('major', selectedMajor || 'General');

        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || 'Error al registrar.');
        } else {
          setSuccessMessage('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
          setTimeout(() => {
            setActiveTab('login');
            setPassword('');
            setSuccessMessage(null);
          }, 2000);
        }
      } else {
        // Login
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || 'Correo o contraseña incorrectos.');
        } else {
          setSuccessMessage('Iniciando sesión...');
          setTimeout(() => {
            login(data.user_id, data.token, data.refresh_token);
          }, 1000);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Upper Accent Decor */}
        <View style={[styles.accentCircle, { backgroundColor: colors.primary, opacity: 0.1 }]} />

        <View style={styles.mainBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoOuter, { borderColor: `${colors.primary}33` }]}>
              <View style={[styles.logoInner, { backgroundColor: colors.primary }]}>
                <Ionicons name="school" size={32} color="#000" />
              </View>
            </View>
            <ThemedText style={styles.appName}>SmartCampus</ThemedText>
            <ThemedText style={[styles.appLocation, { color: colors.muted }]}>GIRARDOT • CUNDINAMARCA</ThemedText>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Tabs Selector */}
            <View style={[styles.tabSelector, { backgroundColor: `${colors.background}88` }]}>
              <TouchableOpacity
                onPress={() => setActiveTab('login')}
                style={[styles.tabOption, activeTab === 'login' && { backgroundColor: colors.primary }]}
              >
                <ThemedText style={[styles.tabLabel, activeTab === 'login' && { color: '#000' }]}>
                  Entrar
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('register')}
                style={[styles.tabOption, activeTab === 'register' && { backgroundColor: colors.primary }]}
              >
                <ThemedText style={[styles.tabLabel, activeTab === 'register' && { color: '#000' }]}>
                  Unirse
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <ThemedText style={styles.formTitle}>
                {activeTab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu perfil'}
              </ThemedText>
              <ThemedText style={[styles.formSubtitle, { color: colors.muted }]}>
                {activeTab === 'login' ? 'Ingresa tus credenciales institucionales' : 'Regístrate para acceder a los servicios'}
              </ThemedText>

              {activeTab === 'register' && (
                <>
                  <View style={styles.field}>
                    <ThemedText style={[styles.label, { color: colors.muted }]}>NOMBRES</ThemedText>
                    <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                      <Ionicons name="person-outline" size={20} color={colors.primary} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Ej. Juan Andrés"
                        placeholderTextColor={`${colors.text}44`}
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                  </View>
                  <View style={styles.field}>
                    <ThemedText style={[styles.label, { color: colors.muted }]}>APELLIDOS</ThemedText>
                    <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                      <Ionicons name="people-outline" size={20} color={colors.primary} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Ej. Pérez Gómez"
                        placeholderTextColor={`${colors.text}44`}
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>
                  <View style={styles.field}>
                    <ThemedText style={[styles.label, { color: colors.muted }]}>NÚMERO DE IDENTIFICACIÓN</ThemedText>
                    <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                      <Ionicons name="card-outline" size={20} color={colors.primary} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Cédula o T.I."
                        placeholderTextColor={`${colors.text}44`}
                        value={identification}
                        onChangeText={setIdentification}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.field}>
                <ThemedText style={[styles.label, { color: colors.muted }]}>CORREO ELECTRÓNICO</ThemedText>
                <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="usuario@ucundinamarca.edu.co"
                    placeholderTextColor={`${colors.text}44`}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {activeTab === 'register' && (
                <View style={styles.field}>
                  <ThemedText style={[styles.label, { color: colors.muted }]}>VÍNCULO INSTITUCIONAL</ThemedText>
                  <View style={styles.roleGrid}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        { borderColor: selectedRole === 'student' ? colors.primary : colors.border },
                        selectedRole === 'student' && { backgroundColor: `${colors.primary}11` }
                      ]}
                      onPress={() => {
                        setSelectedRole('student');
                        setSelectedMajor(null);
                      }}
                    >
                      <Ionicons name="school" size={18} color={selectedRole === 'student' ? colors.primary : colors.muted} />
                      <ThemedText style={[styles.roleText, { color: selectedRole === 'student' ? colors.primary : colors.muted }]}>Estudiante</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        { borderColor: selectedRole === 'teacher' ? colors.primary : colors.border },
                        selectedRole === 'teacher' && { backgroundColor: `${colors.primary}11` }
                      ]}
                      onPress={() => {
                        setSelectedRole('teacher');
                        setSelectedMajor(null);
                      }}
                    >
                      <Ionicons name="briefcase" size={18} color={selectedRole === 'teacher' ? colors.primary : colors.muted} />
                      <ThemedText style={[styles.roleText, { color: selectedRole === 'teacher' ? colors.primary : colors.muted }]}>Docente</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeTab === 'register' && (
                <View style={styles.field}>
                  <ThemedText style={[styles.label, { color: colors.muted }]}>
                    {selectedRole === 'student' ? 'CARRERA / PROGRAMA' : 'FACULTAD / DEPARTAMENTO'}
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.dropdown, { borderColor: colors.border }]}
                    onPress={() => setIsMajorModalVisible(true)}
                  >
                    <ThemedText style={[styles.dropdownText, !selectedMajor && { color: `${colors.text}44` }]}>
                      {selectedMajor || (selectedRole === 'student' ? 'Seleccionar Carrera' : 'Seleccionar Facultad')}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <ThemedText style={[styles.label, { color: colors.muted }]}>CONTRASEÑA</ThemedText>
                  {activeTab === 'login' && (
                    <TouchableOpacity>
                      <ThemedText style={[styles.forgot, { color: colors.primary }]}>¿Olvidaste la clave?</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Min. 6 caracteres"
                    placeholderTextColor={`${colors.text}44`}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {error && <ThemedText style={styles.errorMsg}>{error}</ThemedText>}
              {successMessage && <ThemedText style={styles.successMsg}>{successMessage}</ThemedText>}

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleAuth}
              >
                <ThemedText style={styles.buttonText}>
                  {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear mi Cuenta'}
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal de Carreras */}
          <Modal
            visible={isMajorModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsMajorModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>
                    {selectedRole === 'student' ? 'Selecciona tu Carrera' : 'Selecciona tu Facultad'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setIsMajorModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {(selectedRole === 'student' 
                    ? [
                      'Ingeniería de Software',
                      'Ingeniería Ambiental',
                      'Enfermería',
                      'Administración de Empresas'
                    ]
                    : [
                      'Facultad de Ingeniería',
                      'Facultad de Ciencias de la Salud',
                      'Facultad de Ciencias Administrativas',
                      'Facultad de Educación',
                      'Área de Posgrados',
                      'Dirección Académica'
                    ]
                  ).map((major) => (
                    <TouchableOpacity
                      key={major}
                      style={[
                        styles.majorOption,
                        { borderBottomColor: colors.border },
                        selectedMajor === major && { backgroundColor: `${colors.primary}22` }
                      ]}
                      onPress={() => {
                        setSelectedMajor(major);
                        setIsMajorModalVisible(false);
                      }}
                    >
                      <ThemedText style={[styles.majorOptionText, selectedMajor === major && { color: colors.primary }]}>
                        {major}
                      </ThemedText>
                      {selectedMajor === major && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.footerInfo, { color: colors.muted }]}>
              Al continuar, aceptas las políticas de tratamiento de datos personales de la Universidad de Cundinamarca.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  accentCircle: {
    position: 'absolute',
    top: -width * 0.4,
    right: -width * 0.4,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
  },
  mainBox: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoOuter: {
    width: 90,
    height: 90,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  logoInner: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  appLocation: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  card: {
    borderRadius: 40,
    borderWidth: 1,
    padding: 8,
    overflow: 'hidden',
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 32,
    padding: 6,
    marginBottom: 8,
  },
  tabOption: {
    flex: 1,
    height: 48,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  formContent: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 32,
    lineHeight: 20,
  },
  field: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  forgot: {
    fontSize: 10,
    fontWeight: '900',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    height: 64,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
  errorMsg: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMsg: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  separator: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  footerInfo: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  majorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  majorOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

