import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ColorPicker from "react-native-wheel-color-picker";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { Tabs } from "@/.expo/types/router";

// Constants
const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  previousTab?: string;
}

type newItemType = {
  name: string;
  image_url: string;
  category: string;
  color: string;
  style?: string;
  brand: string;
  season: string;
  tags?: string[];
};

interface quickScanType extends AddItemModalProps {
  upload_uri:string;
}

export default function QuickScanModal({visible, onClose, onSuccess, previousTab, upload_uri}: quickScanType){
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [item, setItem] = useState<newItemType>({
    name: '',
    image_url: '',
    category: '',
    color: '#FFFFFF',
    style: '',
    brand: '',
    season: '',
    tags: []
  })

  const analyzeImage = async(uri:string)=>{
    setIsAnalyzing(true);

    console.log('=== ANALYZE IMAGE STARTED ===');
    console.log('Image URI:', uri);
    console.log('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);

    try{
      const formData = new FormData();
      formData.append('image',{
        uri:uri,
        type:'image/jpeg',
        name:'photo.jpg'
      } as any);

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/quick-scan`,
        {
          method:'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if(!response.ok){
        throw new Error('Failed to analyze image')
      }

      const data = await response.json();
      console.log('AI Analysis', data);

      const suggested = data.suggestedData;
      setItem({
        name:suggested.name || '',
        image_url:uri,
        category:suggested.category || '',
        color: suggested.color || '#FFFFFF',
        style: suggested.style || '',
        brand: suggested.brand || '',
        season: suggested.season || '',
        tags: suggested.tags || [],
      })

      setAiConfidence(data.confidence || null);
      setIsAnalyzed(true);
    }catch(error){
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze image. Pleasse try again.');
    }finally {
      setIsAnalyzing(false);
    }
  }

  const handleSave = async ()=>{
    if (!item.name || !item.category || !item.color || !item.season){
      Alert.alert('Error', 'Please fill in all required field');
      return;
    }
    
    setLoading(true);

    try{
      const {data: { user }} = await supabase.auth.getUser();

      if(!user){
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const {data:insertedData, error:insertError} = await supabase
      .from('clothing_items')
      .insert([{
        user_id:user.id,
        name:item.name,
        image_url:item.image_url,
        category:item.category,
        color:item.color,
        style:item.style,
        brand:item.brand,
        season: item.season,
        tags:item.tags
      }])
      .select()
      .single()

      if(insertError){
        Alert.alert('Error', insertError.message || 'Failed to save item');
        return;
      }

      if(upload_uri && insertedData){
        try{
          const cloudinaryUrl = await uploadImageToCloudinary(upload_uri, `user_${user.id}_item_${insertedData.id}`);

          await supabase
          .from('clothing_items')
          .update({image_url:cloudinaryUrl})
          .eq('id', insertedData.id)
        }catch(error){
          console.log('Upload error:', error);
          Alert.alert('Partial Success', 'Item saved but image upload failed');
        }
      }

      Alert.alert('Success', 'Item saved successfully');
      if(onSuccess){
        onSuccess();
      }

      // onClose();
    }catch(error){
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save item');
    }finally{
      setLoading(false);
    }
  }

  // Retry analysis
  const handleRetry = () => {
    setIsAnalyzed(false);
    setAiConfidence(null);
    analyzeImage(upload_uri);
  };

  useEffect(()=>{
     if(!visible){
      setItem({
        name: '',
        image_url: '',
        category: '',
        color: '',
        style: '',
        brand: '',
        season: '',
        tags: []
      })

      setIsAnalyzed(false);
      setIsAnalyzing(false);
      setAiConfidence(null);
     }else{
        if(visible && upload_uri && !isAnalyzed){
          analyzeImage(upload_uri);
        }
     }
  },[visible, upload_uri])

  const isValid = item.name && item.category && item.color && item.season;

  const onChangeItem = (value:string | string[], field: keyof newItemType)=>{
    setItem(prev=>({
      ...prev,
      [field]:value
    }))
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAF9F6',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: '#FFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
    },
    analyzingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    analyzingText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      marginTop: 16,
    },
    analyzingSubtext: {
      fontSize: 14,
      color: '#6B7280',
      marginTop: 8,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    confidenceBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      gap: 6,
    },
    confidenceText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#10B981',
    },
    aiBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      padding: 14,
      borderRadius: 12,
      marginBottom: 24,
      gap: 10,
    },
    aiBannerText: {
      flex: 1,
      fontSize: 14,
      color: '#92400E',
      fontWeight: '500',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 10,
    },
    input: {
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#1F2937',
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    optionButton: {
      backgroundColor: '#FFF',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    optionButtonActive: {
      backgroundColor: '#E07A5F',
      borderColor: '#E07A5F',
    },
    optionText: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '600',
    },
    optionTextActive: {
      color: '#FFF',
    },
    colorPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    colorBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    colorText: {
      fontSize: 16,
      color: '#1F2937',
      fontWeight: '600',
    },
    infoText: {
      fontSize: 15,
      color: '#6B7280',
      backgroundColor: '#F3F4F6',
      padding: 14,
      borderRadius: 12,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: '#FFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      gap: 12,
    },
    retryButtonLarge: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: 14,
      paddingVertical: 16,
      gap: 8,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6B7280',
    },
    confirmButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E07A5F',
      borderRadius: 14,
      paddingVertical: 16,
      gap: 8,
      shadowColor: '#E07A5F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    confirmButtonDisabled: {
      backgroundColor: '#D1D5DB',
      shadowOpacity: 0,
      elevation: 0,
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFF',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={onClose}
            disabled={loading || isAnalyzing}
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Quick Scan</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={loading || isAnalyzing}
          >
            <Ionicons name="refresh" size={24} color="#E07A5F" />
          </Pressable>
        </View>

        {isAnalyzing ? (
          /* Analyzing State */
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#E07A5F" />
            <Text style={styles.analyzingText}>Analyzing your item...</Text>
            <Text style={styles.analyzingSubtext}>AI is detecting details</Text>
          </View>
        ) : (
          /* Form Content */
          <>
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              {/* Image Preview with Confidence Badge */}
              <View style={styles.section}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: upload_uri }} 
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {aiConfidence && (
                    <View style={styles.confidenceBadge}>
                      <Ionicons name="sparkles" size={16} color="#10B981" />
                      <Text style={styles.confidenceText}>
                        {Math.round(aiConfidence * 100)}% AI Match
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* AI Banner */}
              {isAnalyzed && (
                <View style={styles.aiBanner}>
                  <Ionicons name="bulb" size={20} color="#92400E" />
                  <Text style={styles.aiBannerText}>
                    AI has pre-filled the details. Feel free to edit!
                  </Text>
                </View>
              )}

              {/* Name Input */}
              <View style={styles.section}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Blue Denim Jacket"
                  placeholderTextColor="#9CA3AF"
                  value={item.name}
                  onChangeText={(text) => onChangeItem(text, 'name')}
                  editable={!loading}
                />
              </View>

              {/* Brand Input */}
              <View style={styles.section}>
                <Text style={styles.label}>Brand</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Nike"
                  placeholderTextColor="#9CA3AF"
                  value={item.brand}
                  onChangeText={(text) => onChangeItem(text, 'brand')}
                  editable={!loading}
                />
              </View>

              {/* Style Input */}
              <View style={styles.section}>
                <Text style={styles.label}>Style</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Casual, Formal"
                  placeholderTextColor="#9CA3AF"
                  value={item.style}
                  onChangeText={(text) => onChangeItem(text, 'style')}
                  editable={!loading}
                />
              </View>

              {/* Category Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.optionsContainer}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.optionButton,
                        item.category === category && styles.optionButtonActive,
                      ]}
                      onPress={() => onChangeItem(category, 'category')}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item.category === category && styles.optionTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Season Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Season *</Text>
                <View style={styles.optionsContainer}>
                  {SEASONS.map((season) => (
                    <TouchableOpacity
                      key={season}
                      style={[
                        styles.optionButton,
                        item.season === season && styles.optionButtonActive,
                      ]}
                      onPress={() => onChangeItem(season, 'season')}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item.season === season && styles.optionTextActive,
                        ]}
                      >
                        {season}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Display */}
              <View style={styles.section}>
                <Text style={styles.label}>Color *</Text>
                <View style={styles.colorPreviewRow}>
                  <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                  <Text style={styles.colorText}>{item.color}</Text>
                </View>
              </View>

              {/* Tags Display */}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.label}>Tags</Text>
                  <Text style={styles.infoText}>
                    {item.tags.join(', ')}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.retryButtonLarge}
                onPress={handleRetry}
                disabled={loading}
              >
                <Ionicons name="refresh" size={20} color="#6B7280" />
                <Text style={styles.retryButtonText}>Re-scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !isValid && styles.confirmButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.confirmButtonText}>Confirm & Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
} 