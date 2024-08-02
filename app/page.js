"use client";
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '@/app/firebase/config' // Ensure these imports are correct
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const MyComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (!userDoc.exists()) {
            const registrationData = localStorage.getItem("registrationData");
            const {
              email = ""
            } = registrationData ? JSON.parse(registrationData) : {};
            await setDoc(doc(firestore, "users", user.uid), {
              email: user.email
            });
            localStorage.removeItem("registrationData");
            setUser(user);
            router.push('/dashboard');
          } else {
            setUser(null);
            router.push('/sign-up');
          }
        } else {
          setUser(null);
          router.push('/sign-up');
        }
      } else {
        setUser(null);
        router.push('/sign-up');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      {loading ? <p>Loading...</p> : <p>User: {user ? user.email : 'No user'}</p>}
    </div>
  );
};

export default MyComponent;
