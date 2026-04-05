import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AddItemModal from "@/_components/AddItemModal";
import QuickScanModal from "@/_components/QuickScanModal";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const WEATHER_CODES:{[code:number]: {icon:keyof typeof Ionicons.glyphMap | null, description:string, color:string} } = {
  0: {icon:'sunny', description:'Clear sky', color:'#F59E0B'},
  1: {icon:'partly-sunny', description:'Mainly clear', color:'#F59E0B'},
  2: {icon:'cloudy', description:'Partly cloudy', color:'#9CA3AF'},
  3: {icon:'cloudy', description:'Overcast', color:'#9CA3AF'},
  45: {icon:'cloudy', description:'Fog', color:'#9CA3AF'},
  48: {icon:'cloudy', description:'Depositing rime fog', color:'#9CA3AF'},
  51: {icon:'rainy', description:'Light drizzle', color:'#9CA3AF'},
  53: {icon:'rainy', description:'Moderate drizzle', color:'#9CA3AF'},
  55: {icon:'rainy', description:'Dense drizzle', color:'#9CA3AF'},
  56: {icon:'rainy', description:'Light freezing drizzle', color:'#9CA3AF'},
  57: {icon:'rainy', description:'Dense freezing drizzle', color:'#9CA3AF'},
  61: {icon:'rainy', description:'Slight rain', color:'#9CA3AF'},
  63: {icon:'rainy', description:'Moderate rain', color:'#9CA3AF'},
  65: {icon:'rainy', description:'Heavy rain', color:'#9CA3AF'},
  66: {icon:'rainy', description:'Light freezing rain', color:'#9CA3AF'},
  67: {icon:'rainy', description:'Heavy freezing rain', color:'#9CA3AF'},
  71: {icon:'snow', description:'Slight snow fall', color:'#9CA3AF'},
  73: {icon:'snow', description:'Moderate snow fall', color:'#9CA3AF'},
  75: {icon:'snow', description:'Heavy snow fall', color:'#9CA3AF'},
  77: {icon:'snow', description:'Snow grains', color:'#9CA3AF'},
  80: {icon:'rainy', description:'Slight rain showers', color:'#9CA3AF'},
  81: {icon:'rainy', description:'Moderate rain showers', color:'#9CA3AF'},
  82: {icon:'rainy', description:'Violent rain showers', color:'#9CA3AF'},
  85: {icon:'snow', description:'Slight snow showers', color:'#9CA3AF'},
  86: {icon:'snow', description:'Heavy snow showers', color:'#9CA3AF'},
  95: {icon:'thunderstorm', description:'Thunderstorm', color:'#9CA3AF'},
  96: {icon:'thunderstorm', description:'Thunderstorm with slight hail', color:'#9CA3AF'},
  99: {icon:'thunderstorm', description:'Thunderstorm with heavy hail', color:'#9CA3AF'},
}

export default function Index() {

  const { user} = useAuth();
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const name = user?.user_metadata?.name || "User";
  const [quickScanImageURI, setQuickScanImageURI] = useState<string>('');
  const [isQuickScanModalOpen, setIsQuickScanModalOpen] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalOutfits, setTotalOutfits] = useState<number>(0);
  const [itemsAddedThisMonth, setItemsAddedThisMonth] = useState<number>(0);
  const [currentWhetherCode, setCurrentWhetherCode] = useState<number>(0);
  const [currentTemperature, setCurrentTemperature] = useState<number>(0);

  const getCurrentWeatherCondition = async()=>{
    let {latitude, longitude} = (await Location.getCurrentPositionAsync({})).coords;
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`, {
      method:'GET',
    }).then(res=>res.json());
    const weatherCode = response.current_weather.weathercode;
    const temperature = response.current_weather.temperature;
    setCurrentTemperature(temperature);
    setCurrentWhetherCode(weatherCode);
  }
  
  const fetchStats = async()=>{ 
    //Fetch stats from backend and update state
    const response = await fetch(`${BACKEND_URL}/api/stats?userId=${user?.id}`, {
      method:'GET',
    }).then(res=>res.json());
    setTotalItems(response.totalItems);
    setTotalOutfits(response.totalOutfits);
    setItemsAddedThisMonth(response.itemsAddedThisMonth);
  }

  useEffect(()=>{
    getCurrentWeatherCondition();
    fetchStats();
  },[])

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 18) {
      return "Good Evening,";
    } else if (hour >= 12) {
      return "Good Afternoon,";
    } else {
      return "Good Morning,";
    }
  };

  const closeQuickScanModal = ()=>{
    setQuickScanImageURI('');
    setIsQuickScanModalOpen(false);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAF9F6',
    },
    header: {
      padding: 24,
      paddingTop: 60,
    },
    greeting: {
      fontSize: 16,
      color: '#6B7280',
    },
    name: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    card: {
      backgroundColor: '#FFF',
      marginHorizontal: 24,
      padding: 20,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardContent: {
      marginLeft: 16,
    },
    temperature: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    weatherDesc: {
      fontSize: 14,
      color: '#6B7280',
    },
    actions: {
      flexDirection: 'column',
      paddingHorizontal: 24,
      marginTop: 24,
      gap: 12,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: '#E07A5F',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 8,
    },
    primaryButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: '#FFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
      color: '#1F2937',
      fontSize: 16,
      fontWeight: '600',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      marginTop: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFF',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    statLabel: {
      fontSize: 10,
      color: '#9CA3AF',
      marginTop: 4,
    },
  });

  //Image picker
  const pickImage = async()=>{
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if(!permissionResult.granted){
      Alert.alert('Permission required', 'Permission to access the camera is required.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes:'images',
      allowsEditing:true,
      aspect:[3,4],
      quality:1
    })

    console.log(result.canceled);

    if(!result.canceled){
      setQuickScanImageURI(result.assets[0].uri);
      setIsQuickScanModalOpen(true);
    }

    //Proceed Quick Scan Modal
    
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>

        {/* Weather Card */}
        <View style={styles.card}>
          <Ionicons name={WEATHER_CODES[currentWhetherCode]?.icon || 'sunny'} size={32} color={WEATHER_CODES[currentWhetherCode]?.color || '#9CA3AF'}/>
          <View style={styles.cardContent}>
            <Text style={styles.temperature}>{currentTemperature}°C</Text>
            <Text style={styles.weatherDesc}>{WEATHER_CODES[currentWhetherCode]?.description || 'Unknown'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={()=>pickImage()}>
            <Ionicons name="camera" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Quick Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={()=>setShowAddItemModal(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#1F2937" />
            <Text style={styles.secondaryButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={[styles.statLabel, {textAlign:'center'}]}>TOTAL ITEMS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalOutfits}</Text>
            <Text style={[styles.statLabel, {textAlign:'center'}]}>OUTFITS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{itemsAddedThisMonth}</Text>
            <Text style={[styles.statLabel, {textAlign:'center'}]}>ITEM ADD THIS MONTH</Text>
          </View>
        </View>
      </ScrollView>
      <AddItemModal
        visible={showAddItemModal}
        onClose={()=>setShowAddItemModal(false)}
      />
      <QuickScanModal 
        visible={isQuickScanModalOpen}
        onSuccess={closeQuickScanModal}
        onClose={closeQuickScanModal}
        upload_uri={quickScanImageURI}
      />
    </>
    
  );
}