import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Cart functions
export const saveCartItem = async (userId, item) => {
  try {
    // Validate that we have a userId
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Import auth to check current user
    const { auth } = require('../firebase');
    const currentUser = auth.currentUser;

    console.log('=== AUTH DEBUG ===');
    console.log('Auth current user:', currentUser);
    console.log('Auth current user UID:', currentUser?.uid);
    console.log('Passed userId:', userId);
    console.log('User IDs match:', currentUser?.uid === userId);
    console.log('User email verified:', currentUser?.emailVerified);
    console.log('Auth state:', !!currentUser);
    console.log('User email:', currentUser?.email);

    // Get the auth token to verify it's valid
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        console.log('Token exists:', !!token);
        console.log('Token length:', token.length);
      } catch (tokenError) {
        console.error('Token error:', tokenError);
      }
    }
    console.log('=== END AUTH DEBUG ===');

    const cartRef = doc(db, 'users', userId, 'cart', item.id.toString());
    await setDoc(cartRef, {
      ...item,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving cart item:', error);
    console.error('User ID:', userId);
    console.error('Item:', item);
    throw error;
  }
};

export const getCartItems = async (userId) => {
  try {
    const cartRef = collection(db, 'users', userId, 'cart');
    const querySnapshot = await getDocs(cartRef);
    const cartItems = [];
    querySnapshot.forEach((doc) => {
      cartItems.push({ id: doc.id, ...doc.data() });
    });
    return cartItems;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const cartRef = collection(db, 'users', userId, 'cart');
    const querySnapshot = await getDocs(cartRef);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Request functions
export const saveRequest = async (userId, requestData) => {
  try {
    const requestsRef = collection(db, 'users', userId, 'requests');
    const docRef = await addDoc(requestsRef, {
      ...requestData,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving request:', error);
    throw error;
  }
};

export const getRequests = async (userId) => {
  try {
    const requestsRef = collection(db, 'users', userId, 'requests');
    const querySnapshot = await getDocs(requestsRef);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return requests.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

export const getRequest = async (userId, requestId) => {
  try {
    const requestRef = doc(db, 'users', userId, 'requests', requestId);
    const docSnap = await getDoc(requestRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching request:', error);
    throw error;
  }
};