"use client";
import React, {useEffect, useState} from 'react'
import {Box, Typography, Stack, Button, Modal, TextField} from '@mui/material'
import {firestore, auth} from '@/app/firebase/config'
import {collection, doc, query, getDocs, setDoc, deleteDoc, getDoc} from 'firebase/firestore'
import { async } from '@firebase/util';
import { useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged } from 'firebase/auth';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [ user, setUser] = useState(null)
  const router = useRouter()

  const [pantry, setPantry] = useState([])

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [itemName, setItemName] = useState('')

    // State to hold the search query
    const [searchQuery, setSearchQuery] = useState('');

    // Filtered items based on the search query
    const filteredItems = pantry.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const updatePantry = async (uid) => {
    try {
      const snapshot = query(collection(firestore, `users/${uid}/pantry`));
      const docs = await getDocs(snapshot);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push({ name: doc.id, ...doc.data() });
      });
      setPantry(pantryList);
    } catch (error) {
      console.error("Error fetching pantry items:", error);
    }
  };
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (user.emailVerified) {
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists()) {
                    setUser(user);
                    await updatePantry(user);
                } else {
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
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
        updatePantry(user.uid)
    }
  }, [user])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, `users/${user.uid}/pantry`), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + 1})
    } else {
      await setDoc(docRef, {count: 1})
    }
    await updatePantry(user.uid)
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, `users/${user.uid}/pantry`), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if (count === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {count: count - 1})
      }
    } 
    await updatePantry(user.uid)
  }

  const handleSignout = async () => {
    try {
        await signOut(auth);
        router.push('sign-in');
    } catch (error) {
        console.error("logout failed", error);
    }
  }


  return (
  <Box 
  width="100vw" 
  height="100vh"
  display={'flex'}
  justifyContent={'center'}
  flexDirection={'column'}
  alignItems={'center'}
  gap={2}
  >
    <Button 
        variant="outlined"
        onClick={handleSignout}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        Logout
      </Button>
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width='100%' direction={'row'} spacing={2}>
            <TextField 
              id="outlined-basic" 
              label="Item" 
              variant="outlined" 
              fullWidth
              value={itemName.toLowerCase()}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="outline" 
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
              }
            }>Add</Button>
          </Stack>
        </Box>
      </Modal>
    <Button variant="contained" onClick={handleOpen}> Add Item </Button>
    <TextField
        label="Search Pantry"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ width: '800px', mb: 2 }}
    />
    <Box 
    border={'1px solid #333'}>
      <Box 
      width="800px" 
      height="100px" 
      bgcolor={'#ADD8E6'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      border={'1px solid #333'}
      >
        <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={1} overflow={'auto'}>
        {filteredItems.map(({name, count}) => (
          
          <Box 
            key={name}
            width="100%"
            minHeight="150px"
            maxHeight="150px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            paddingX={5}
          >
            <Typography 
              variant={'h3'} 
              color={'#333'} 
              textAlign={'center'}
            >
              {
                name.charAt(0).toUpperCase() + name.slice(1)
              }
            </Typography>
            <Typography 
              variant={'h3'} 
              color={'#333'} 
              textAlign={'center'}
            > 
              Quantity: {count} 
            </Typography>
            
            <Button variant='contained' onClick={() => removeItem(name)}>Remove</Button>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
  )
}
