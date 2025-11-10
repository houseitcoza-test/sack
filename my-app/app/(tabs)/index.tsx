import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView, Image, Platform, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';



const services = [
  { id: 'electrician', name: 'Electrician', icon: 'bolt.fill', color: '#000000' },
  { id: 'plumbing', name: 'Plumbing', icon: 'wrench.fill', color: '#000000' },
  { id: 'roofing', name: 'Roofing', icon: 'house.fill', color: '#000000' },
  { id: 'painting', name: 'Painter', icon: 'paintbrush.fill', color: '#000000' },
  { id: 'mechanic', name: 'In-House Mechanic', icon: 'car.fill', color: '#000000' },
  { id: 'entertainment', name: 'Home Entertainment', icon: 'tv.fill', color: '#000000' },
  { id: 'interior', name: 'Interior Design', icon: 'sofa.fill', color: '#000000' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [user] = useAuthState(auth);
  
  const navigateToService = (serviceId: string) => {
    router.push(`/service/${serviceId}`);
  };

  return (
  <ParallaxScrollView
    headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
    headerImage={
      <ThemedView
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + 24,
            height: 120,
          },
        ]}
      >
        <Image
          source={require('@/assets/images/houseit-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.headerSubtitle}>Home Services at Your Fingertips</ThemedText>
        {!user && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    }
  >
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>What service do you need?</ThemedText>

      <ScrollView style={styles.servicesContainer} showsVerticalScrollIndicator={false}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => navigateToService(service.id)}
          >
            <ThemedView style={[styles.serviceCard, { borderLeftColor: service.color }]}>
              <ThemedView style={styles.serviceContent}>
                <IconSymbol name={service.icon as any} size={24} color="#000000" style={styles.serviceIcon} />
                <ThemedView style={styles.serviceInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.serviceName}>
                    {service.name}
                  </ThemedText>
                  <ThemedText style={styles.serviceDescription}>
                    Professional {service.name.toLowerCase()} services
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.arrow}>›</ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  </ParallaxScrollView>
);
}

const styles = StyleSheet.create({
  headerContainer: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  logo: {
    width: 800,
    height: 130,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  servicesContainer: {
    flex: 1,
  },
  serviceCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  serviceIcon: {
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 24,
    opacity: 0.3,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
