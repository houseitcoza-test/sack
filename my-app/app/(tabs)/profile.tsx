
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { getRequests } from '../../services/firestoreService';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const [user, loading] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const requests = await getRequests(user.uid);
      setOrders(requests);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
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
          <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.notLoggedIn}>Please log in to view your profile</ThemedText>
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
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <ThemedView style={styles.userInfoCard}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Account Information
          </ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Email:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
          </ThemedView>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Order History Section */}
        <ThemedView style={styles.orderHistorySection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Order History
          </ThemedText>
          
          {loadingOrders ? (
            <ActivityIndicator size="small" color="#000000" style={styles.loader} />
          ) : orders.length === 0 ? (
            <ThemedText style={styles.noOrders}>No orders yet</ThemedText>
          ) : (
            orders.map((order) => (
              <ThemedView key={order.id} style={styles.orderCard}>
                <ThemedView style={styles.orderHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.orderId}>
                    Order #{order.id.substring(0, 8)}
                  </ThemedText>
                  <ThemedView style={[
                    styles.statusBadge,
                    order.status === 'completed' && styles.statusCompleted,
                    order.status === 'pending' && styles.statusPending,
                    order.status === 'in_progress' && styles.statusInProgress,
                  ]}>
                    <ThemedText style={styles.statusText}>
                      {order.status || 'pending'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedText style={styles.orderDate}>
                  {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Date unavailable'}
                </ThemedText>

                {order.items && order.items.length > 0 && (
                  <ThemedView style={styles.orderItems}>
                    {order.items.map((item, index) => (
                      <ThemedText key={index} style={styles.orderItem}>
                        • {item.name} x{item.quantity} - R{(item.price * item.quantity).toFixed(2)}
                      </ThemedText>
                    ))}
                  </ThemedView>
                )}

                <ThemedText style={styles.orderTotal}>
                  Total: R{order.items && order.items.length > 0 
                    ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
                    : '0.00'}
                </ThemedText>
              </ThemedView>
            ))
          )}
        </ThemedView>
      </ScrollView>
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
  },
  title: {
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notLoggedIn: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderHistorySection: {
    backgroundColor: 'transparent',
  },
  loader: {
    marginTop: 20,
  },
  noOrders: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  orderCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  orderId: {
    fontSize: 16,
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  statusPending: {
    backgroundColor: '#FFA500',
  },
  statusInProgress: {
    backgroundColor: '#007AFF',
  },
  statusCompleted: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  orderItem: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
  },
});
