import { useLocalSearchParams, router, Stack } from 'expo-router';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
const providerServices = {
  electrician: {
    1: {
      name: 'Lightning Electric Co.',
      services: [
        { id: 1, name: 'Outlet Installation', price: 45, description: 'Install new electrical outlet' },
        { id: 2, name: 'Light Fixture Installation', price: 65, description: 'Install ceiling or wall light fixtures' },
        { id: 3, name: 'Circuit Breaker Repair', price: 85, description: 'Diagnose and repair circuit breaker issues' },
        { id: 4, name: 'Electrical Panel Upgrade', price: 350, description: 'Upgrade electrical panel for modern needs' },
        { id: 5, name: 'Wiring Inspection', price: 120, description: 'Complete electrical wiring safety inspection' },
      ]
    }
  },
  plumbing: {
    1: {
      name: 'AquaFix Pro',
      services: [
        { id: 1, name: 'Leak Repair', price: 85, description: 'Fix pipe and faucet leaks' },
        { id: 2, name: 'Drain Cleaning', price: 95, description: 'Clear clogged drains and pipes' },
        { id: 3, name: 'Toilet Installation', price: 150, description: 'Install new toilet fixture' },
        { id: 4, name: 'Water Heater Repair', price: 180, description: 'Diagnose and repair water heater issues' },
        { id: 5, name: 'Pipe Replacement', price: 250, description: 'Replace damaged or old pipes' },
      ]
    }
  }
};

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import { saveCartItem, clearCart, saveRequest, getCartItems } from '../../../services/firestoreService';

export default function ProviderMenuScreen() {
  const { serviceId, providerId } = useLocalSearchParams();
  const [cart, setCart] = useState<{id: number, name: string, price: number, quantity: number}[]>([]);
  const [user, loading, error] = useAuthState(auth);

  const serviceKey = Array.isArray(serviceId) ? serviceId[0] : serviceId;
  const providerKey = Array.isArray(providerId) ? providerId[0] : providerId;

  const provider = providerServices[serviceKey as keyof typeof providerServices]?.[parseInt(providerKey)];

  useEffect(() => {
    const loadCart = async () => {
      if (user?.uid) {
        try {
          const items = await getCartItems(user.uid);
          setCart(items);
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    };
    loadCart();
  }, [user]);

  if (!provider) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Provider not found</ThemedText>
      </ThemedView>
    );
  }

  const addToCart = async (service: any) => {
    if (!user || loading) {
      Alert.alert('Authentication Required', 'Please log in to add items to cart.');
      return;
    }

    if (!user.uid) {
      Alert.alert('Error', 'User authentication incomplete. Please try logging out and back in.');
      return;
    }

    const existingItem = cart.find(item => item.id === service.id);
    let updatedItem;

    if (existingItem) {
      updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
      setCart(cart.map(item => 
        item.id === service.id 
          ? updatedItem
          : item
      ));
    } else {
      updatedItem = { ...service, quantity: 1 };
      setCart([...cart, updatedItem]);
    }

    try {
      console.log('Saving cart item for user:', user.uid);
      await saveCartItem(user.uid, updatedItem);
      console.log('Cart item saved successfully');
    } catch (error) {
      console.error('Cart save error:', error);
      Alert.alert('Error', `Failed to save item to cart: ${error.message}`);

      // Revert the cart change on error
      if (existingItem) {
        setCart(cart.map(item => 
          item.id === service.id 
            ? existingItem
            : item
        ));
      } else {
        setCart(cart.filter(item => item.id !== service.id));
      }
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const checkout = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to book services', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth') }
      ]);
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add services to your cart first');
      return;
    }

    try {
      const requestData = {
        items: cart,
        total: getTotalPrice(),
        totalAmount: getTotalPrice(),
        providerName: provider.name,
        serviceType: serviceKey,
        providerId: providerKey
      };

      const requestId = await saveRequest(user.uid, requestData);
      await clearCart(user.uid);
      setCart([]);

      Alert.alert(
        'Booking Confirmed!',
        `Your total is R${getTotalPrice()}. Request ID: ${requestId}. A professional will arrive within the estimated time.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/')
          }
        ]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>‹ Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{provider.name}</ThemedText>
        <ThemedText style={styles.subtitle}>Select services you need</ThemedText>
      </ThemedView>

      <ScrollView style={styles.servicesContainer} showsVerticalScrollIndicator={false}>
        {provider.services.map((service) => (
          <ThemedView key={service.id} style={styles.serviceCard} lightColor = "#FFFFFF">
            <ThemedView style={styles.serviceInfo}>
              <ThemedText type="defaultSemiBold" style={styles.serviceName}>
                {service.name}
              </ThemedText>
              <ThemedText style={styles.serviceDescription}>
                {service.description}
              </ThemedText>
              <ThemedText style={styles.servicePrice}>
                R{service.price}
              </ThemedText>
            </ThemedView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(service)}
            >
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ScrollView>

      {cart.length > 0 && (
        <ThemedView style={styles.cartContainer}>
          <ThemedView style={styles.cartHeader}>
            <ThemedText type="defaultSemiBold" style={styles.cartTitle}>
              Cart ({cart.length} items)
            </ThemedText>
            <ThemedText style={styles.cartTotal}>
              Total: R{getTotalPrice()}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity style={styles.checkoutButton} onPress={checkout}>
            <ThemedText style={styles.checkoutButtonText}>
              Book Services - R{getTotalPrice()}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#000000',
    fontSize: 18,
  },
  title: {
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666666',
    fontSize: 16,
  },
  servicesContainer: {
    flex: 1,
    padding: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    marginBottom: 6,
    color: '#000000',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTitle: {
    fontSize: 18,
    color: '#000000',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  checkoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
