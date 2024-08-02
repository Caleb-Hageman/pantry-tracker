"use client";
import { useState } from 'react';
import { Box, Button, Grid, TextField, Typography, Snackbar, Alert } from '@mui/material';
import {createUserWithEmailAndPassword, sendEmailVerification} from 'firebase/auth'
import {auth} from '../firebase/config'
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter()

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);

        localStorage.setItem(
            "registrationData",
            JSON.stringify({
                email
            })
        );

        setMessage("Account Created Successfully. Please verify your email.");
        setSnackbarOpen(true);
        setEmail('');
        setPassword('');
    } catch (error){
        if (error instanceof Error){ 
            setError(error.message);
        } else {
            setError("An unkown error occurred");
        }
    }
  };

  const handleSignInRedirect = () => {
    router.push('/sign-in'); // Change to your sign-in page route
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
            Register Account
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
              Sign Up
            </Button>
          </form>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ marginTop: '16px', cursor: 'pointer' }}
            onClick={handleSignInRedirect}
            onMouseOver={(e) => (e.target.style.color = 'blue')}
            onMouseOut={(e) => (e.target.style.color = 'inherit')}
          >
            Have an account? Sign in
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default SignUpPage;