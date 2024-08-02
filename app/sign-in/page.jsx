"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import {auth, firestore} from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import link from "next/link";


const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter()



  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null)
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user  = userCredential.user;

        if (user.emailVerified) {
            //const registrationData = localStorage.getItem("registrationData");
            
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(firestore, "users", user.uid), {
                    email: user.email,
                });
            }
            router.push('/dashboard');
        } else {
            setError('Please verify your email address');
        }

    } catch (error) {
        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("Unkown error")
        }
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/sign-up'); // Change to your sign-in page route
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item xs={12} sm={8} md={4}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={3}
          borderRadius={2}
          boxShadow={3}
          bgcolor="background.paper"
        >
          <Typography variant="h5" gutterBottom>
            Sign In
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: '16px' }}
            >
              Sign In
            </Button>
          </form>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ marginTop: '16px', cursor: 'pointer' }}
            onClick={handleSignUpRedirect}
            onMouseOver={(e) => (e.target.style.color = 'blue')}
            onMouseOut={(e) => (e.target.style.color = 'inherit')}
          >
            Don&apos;t have an account? Sign up
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default SignInPage;