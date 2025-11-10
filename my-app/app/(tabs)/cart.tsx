
import { StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { getCartItems, clearCart, saveRequest } from '../../services/firestoreService';
import { useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function CartScreen() {
  const [user, loading] = useAuthState(auth);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadCart();
    } else {
      setLoadingCart(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadCart();
      }
    }, [user])
  );

  const loadCart = async () => {
    try {
      setLoadingCart(true);
      const items = await getCartItems(user.uid);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    try {
      const requestData = {
        items: cartItems,
        total: parseFloat(getTotalPrice()),
        status: 'pending',
      };

      await saveRequest(user.uid, requestData);
      await clearCart(user.uid);
      setCartItems([]);
      
      Alert.alert('Success', 'Your order has been placed!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/profile') }
      ]);
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart(user.uid);
              setCartItems([]);
              Alert.alert('Success', 'Cart cleared');
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            }
          },
        },
      ]
    );
  };

  if (loading || loadingCart) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Cart</ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.emptyText}>Please log in to view your cart</ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
          >
            <ThemedText style={styles.loginButtonText}>Log In</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Cart</ThemedText>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <ThemedText style={styles.clearButton}>Clear All</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {cartItems.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Your cart is empty</ThemedText>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <ThemedText style={styles.browseButtonText}>Browse Services</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <>
          <ScrollView 
            style={styles.itemsContainer} 
            contentContainerStyle={styles.itemsContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((item) => (
              <ThemedView key={item.id} style={styles.cartItem}>
                <ThemedView style={styles.itemInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.itemName}>
                    {item.name}
                  </ThemedText>
                  {item.description && (
                    <ThemedText style={styles.itemDescription}>
                      {item.description}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.itemPrice}>
                    R{item.price} x {item.quantity}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.itemTotal}>
                  R{(item.price * item.quantity).toFixed(2)}
                </ThemedText>
              </ThemedView>
            ))}
            {/* Add padding at bottom to ensure content doesn't hide behind checkout container */}
            <ThemedView style={styles.bottomSpacer} />
          </ScrollView>

          <ThemedView style={styles.checkoutContainer}>
            <ThemedView style={styles.totalRow}>
              <ThemedText type="defaultSemiBold" style={styles.totalLabel}>
                Total:
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.totalAmount}>
                R{getTotalPrice()}
              </ThemedText>
            </ThemedView>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <ThemedText style={styles.checkoutButtonText}>
                Place Order
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </>
      )}
    </ThemedView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#000000',
  },
  clearButton: {
    color: '#FF3B30',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  browseButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContentContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  bottomSpacer: {
    height: 140,
    backgroundColor: 'transparent',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666666',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  totalLabel: {
    fontSize: 20,
    color: '#000000',
  },
  totalAmount: {
    fontSize: 20,
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
