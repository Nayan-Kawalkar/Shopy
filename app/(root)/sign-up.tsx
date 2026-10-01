import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { s } from '../styles'; // Import global styles
import images from '@/constants/images';
import icons from '@/constants/icons';
import { getProperties, login } from '@/lib/supabase';
import { useSupabase } from '@/lib/useSupabase';
import { useGlobalContext } from '@/lib/global-provider';


const App = () => {
  const { isLogged, loading } = useGlobalContext();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The welcome collage uses the shop's own product photos (placeholders until they load).
  const { data: products } = useSupabase({
    fn: getProperties,
    params: { filter: "All", query: "", limit: 6 },
  });
  const photos = (products ?? []).map((product) => product.image).filter((uri): uri is string => !!uri);
  const tiles = Array.from({ length: 6 }, (_, i) => photos[i] ?? null);
  const columns = [tiles.slice(0, 2), tiles.slice(2, 4), tiles.slice(4, 6)];

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
      <ScrollView style={{ width: '100%' }}>
        {/* Product collage + logo */}
        <View style={styles.hero}>
          <View style={styles.collage}>
            {columns.map((column, i) => (
              <View key={i} style={[styles.collageColumn, i === 1 && styles.collageColumnOffset]}>
                {column.map((uri, j) =>
                  uri ? (
                    <Image key={j} source={{ uri }} style={styles.tile} resizeMode="cover" />
                  ) : (
                    <View key={j} style={styles.tile} />
                  )
                )}
              </View>
            ))}
          </View>
          <View style={styles.logoWrap}>
            <Image source={images.logo} style={styles.logo} accessibilityLabel="Digital Farm logo" />
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.contain}>
          {/* Subheading */}
          <View style={[styles.contain, { gap: 10 }]}>
            <Text style={styles.welcomeText}>
              Welcome to Digital Farm
            </Text>


            <Text style={styles.heading}>
              Shop Farm-Fresh Groceries
              <Text style={styles.highlightedText}> Within Your Budget </Text>
            </Text>
          </View>

          {/* Login Prompt */}
          <Text style={styles.loginPrompt}>
            Login to Digital Farm with Google
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
  hero: {
    width: '100%',
    paddingTop: 12,
    marginBottom: 24,
  },
  collage: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    height: 330,
    overflow: 'hidden',
  },
  collageColumn: {
    flex: 1,
    gap: 10,
  },
  collageColumnOffset: {
    marginTop: 40,
  },
  tile: {
    width: '100%',
    height: 150,
    borderRadius: 18,
    backgroundColor: '#EAF6EA',
  },
  logoWrap: {
    alignSelf: 'center',
    marginTop: -46,
    padding: 5,
    borderRadius: 28,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: 84,
    height: 84,
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
