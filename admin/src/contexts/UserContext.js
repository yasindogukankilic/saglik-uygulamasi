import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null); // Auth'dan gelen ham kullanıcı
  const [profile, setProfile] = useState(null); // Firestore'dan gelen kullanıcı profili
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setProfile({ id: user.uid, ...userSnap.data() });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={{ firebaseUser, profile, setProfile, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
