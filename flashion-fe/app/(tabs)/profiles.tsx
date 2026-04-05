import React, { useEffect } from "react";
import { 
        View, 
        Text,
        StyleSheet,
        ScrollView, 
        TouchableOpacity,
        Image,
        Switch,
        Alert
}from "react-native";  

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from '../../context/AuthContext';
import { useState } from "react";
import { fetchStats } from "../../utils/helpers";
import AccountSettings from "@/_components/AccountSettings";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  // Profile Card
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E07A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  editButton: {
    fontSize: 14,
    color: '#E07A5F',
    fontWeight: '600',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Sections
  sectionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconContainerDestructive: {
    backgroundColor: '#FEE2E2',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingLabelDestructive: {
    color: '#EF4444',
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    paddingVertical: 16,
  },
});

interface SettingItemProps{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?:string;
    onPress?: () => void;
    trailing?:React.ReactNode;
    destructive?: boolean;
}

function SettingItem({
    icon,
    label,
    description,
    onPress,
    trailing,
    destructive = false,
}: SettingItemProps){

  return(
    <>
      <TouchableOpacity
          style={styles.settingItem}
          onPress={onPress}
          activeOpacity={0.7}
      >
          <View 
              style={[
                  styles.settingIconContainer,
                  destructive && styles.settingIconContainerDestructive
              ]}>
                  <Ionicons
                      name={icon}
                      size={20}
                      color={destructive ? '#EF4444' : '#6B7280'}
                  />
          </View>
          
          <View style={styles.settingContent} >
              <Text style={[
                  styles.settingLabel,
                  destructive && styles.settingLabelDestructive
              ]}>
                  {label}
              </Text>
              {description && (
                  <Text style={styles.settingDescription}>
                      {description}
                  </Text>
              )}
          </View>
          {trailing !== null && (
              trailing || (
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
              )
          )}

      </TouchableOpacity>
    </>
      
  )
}

// const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Profiles(){
  const {user, signOut} = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalOutfits, setTotalOutfits] = useState<number>(0);
  const [itemsAddThisMonth, setItemsAddedThisMonth] = useState<number>(0);
  const [visible, setVisible] = useState(false);

  const handlePress = ()=>{
    setVisible(true);
  }

  const closeModal = ()=>{
    setVisible(false);
  }


  const USER_STATS = [
    {label: 'Items', value:totalItems, icon:'shirt-outline'},
    {label: 'Outfits', value:totalOutfits, icon:'sparkles-outline'},
    {label: 'Added This Month', value:itemsAddThisMonth, icon:'calendar-outline'},
  ]

  const userName = user?.user_metadata?.name || "User";
  const userEmail = user?.email || "";

  const getStats = async()=>{
    //Fetch stats from backend and update state
    const response = await fetchStats(user?.id || '');
    setTotalItems(response.totalItems);
    setTotalOutfits(response.totalOutfits);
    setItemsAddedThisMonth(response.itemsAddedThisMonth);
  }

  useEffect(()=>{
    getStats();
  },[])


  const handleLogout = () => {
      Alert.alert(
          "Log out",
          "Are you sure you want to log out?",
          [
              {text: "Cancel", style: "cancel"},
              {text: "Logout", style: "destructive", onPress: async ()=>{
                  await signOut();
                  router.replace("/(auth)");
              }}
          ]
      )
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Profile Info */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                </View>
                <TouchableOpacity style={styles.cameraButton}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
                <TouchableOpacity>
                  <Text style={styles.editButton}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              {USER_STATS.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Ionicons name={stat.icon as any} size={20} color="#E07A5F" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Settings Sections */}
          <View style={styles.sectionsContainer}>

            {/* Account */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ACCOUNT</Text>
              </View>
              <View style={styles.sectionContent}>
                <SettingItem
                  icon="person-outline"
                  label="Account Settings"
                  description="Password, email, security"
                  onPress={handlePress}
                />
              </View>
            </View>

            {/* Support */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SUPPORT</Text>
              </View>
              <View style={styles.sectionContent}>
                <SettingItem
                  icon="help-circle-outline"
                  label="Help Center"
                  description="FAQs and support"
                />
              </View>
            </View>

            {/* Logout */}
            <View style={styles.section}>
              <View style={styles.sectionContent}>
                <SettingItem
                  icon="log-out-outline"
                  label="Log Out"
                  onPress={handleLogout}
                  destructive
                  trailing={null}
                />
              </View>
            </View>

            {/* App Version */}
            <Text style={styles.versionText}>Flashion App v1.0.0</Text>
          </View>
        </ScrollView>
      </View>
      <AccountSettings visible={visible} onClose={closeModal} onSuccess={closeModal} />
    </>
  );
    
}