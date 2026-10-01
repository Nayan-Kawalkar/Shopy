import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { s } from '../styles'; // Import global styles
import images from '@/constants/images';
import icons from '@/constants/icons';
import {login} from '@/lib/supabase';
import { useGlobalContext } from '@/lib/global-provider';


const App = () => {
  const { isLogged, loading } = useGlobalContext();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isLogged) return <Redirect href="/" />;

  // Function to handle login submission
  const handleLogin = async () => {
    setError(null);
    setSigningIn(true);
    const result = await login();
    setSigningIn(false);

    if(result){
      router.replace("/");
    } else {
      setError("Google sign-in was cancelled or failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView  >
        {/* Onboarding Image */}
        <Image source={images.onboarding} style={styles.image} />

        {/* Welcome Section */}
        <View style={styles.contain}>
          {/* Subheading */}
          <View style={[styles.contain, { gap: 10 }]}>
            <Text style={styles.welcomeText}>
              Welcome To Restate
            </Text>

          
            <Text style={styles.heading}>
              Let's Get You Closer to 
              <Text style={styles.highlightedText}> Your Ideal Home </Text>
            </Text>
          </View>
        
          {/* Login Prompt */}
          <Text style={styles.loginPrompt}>
            Login to ReState with Google
          </Text>
        </View>

        {/* Google Login Button */}
        <View style={{ alignItems: 'center', gap:0 }}>
          <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={signingIn}>
            <View style={styles.buttonContent}>
              {signingIn ? (
                <ActivityIndicator color={s.primary[300]} />
              ) : (
                <Image source={icons.google} style={styles.googleIcon} />
              )}
              <Text style={styles.buttonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        
      </ScrollView>
      
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Equivalent to bg-white
    height: '100%', // Equivalent to h-full
    justifyContent: 'center',
    alignItems: 'center',
  },
  contain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
    gap: 20,
  },
  image: {
    width: '100%', // Fill the width of its container
    height: 480, // Fixed height for the image
  },
  welcomeText: {
    color: s.black[200],
    fontFamily: "Rubik-Regular",
    textTransform: 'uppercase',
  },
  heading: {
    color: s.black[300],
    fontFamily: "Rubik-Bold",
    fontSize: 28,
    textAlign: 'center',
  },
  highlightedText: {
    color: s.primary[300],
  },
  loginPrompt: {
    color: s.black[200],
    fontFamily: "Rubik-SemiBold",
  },
  button: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#666876', // Approximation of zinc-300
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.0,
    shadowRadius: 10,
    elevation: 4, // Required for shadows on Android
    borderRadius: 9999, // Full border radius
    width: '96%',
    height: 50,
    paddingVertical: 16,
    marginTop: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIcon: {
    width: 31,
    height: 32,
  },
  buttonText: {
    color: s.black[200],
    fontFamily: "Rubik-Medium",
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: s.danger,
    fontFamily: "Rubik-Regular",
    marginTop: 12,
    textAlign: 'center',
  },
});

export default App;
