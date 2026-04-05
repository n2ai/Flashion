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

export default function AddItemModal({ visible, onClose, onSuccess, previousTab }: AddItemModalProps) {
  const [items, setItems] = useState<newItemType>({
    name: '',
    image_url: '',
    category: '',
    color: '#FFFFFF',
    style: '',
    brand: '',
    season: '',
    tags: []
  });
  const [loading, setLoading] = useState<boolean>(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAF9F6',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: '#FAF9F6',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 24,
      paddingBottom: 120,
    },
    section: {
      marginBottom: 32,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 12,
    },
    // Image Upload
    imageContainer: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#F3F4F6',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    removeImageButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    uploadButton: {
      flex: 1,
      aspectRatio: 4 / 3,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderStyle: 'dashed',
      backgroundColor: 'rgba(249, 250, 251, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    uploadButtonText: {
      fontSize: 12,
      color: '#9CA3AF',
    },
    // Input
    input: {
      height: 56,
      borderRadius: 12,
      backgroundColor: '#FFF',
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#1F2937',
    },
    // Options (Category & Season)
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: '#FFF',
    },
    optionButtonActive: {
      backgroundColor: '#1F2937',
    },
    optionText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#6B7280',
    },
    optionTextActive: {
      color: '#FFF',
    },
    seasonButton: {
      backgroundColor: '#FFF',
    },
    seasonButtonActive: {
      backgroundColor: '#E07A5F',
    },
    seasonTextActive: {
      color: '#FFF',
    },
    // Colors
    colorPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    colorBox: {
      width: 48,
      height: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: '#FAF9F6',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    saveButton: {
      height: 56,
      borderRadius: 16,
      backgroundColor: '#1F2937',
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFF',
    },
  });

  useEffect(() => {
    if (!visible) {
      setItems({
        name: '',
        image_url: '',
        category: '',
        color: '#FFFFFF',
        style: '',
        brand: '',
        season: '',
        tags: []
      });
    }
  }, [visible]);

  // Image Picker camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChangeItem(uri, 'image_url');
    }
  }

  // Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChangeItem(uri, 'image_url');
    }
  }

  // Save Item Handler
  const handleSave = async () => {
    const selectedName = items.name;
    const selectedCategory = items.category;
    const selectedColor = items.color;
    const selectedSeason = items.season;
    const localImageUri = items.image_url;

    if (!selectedName || !selectedCategory || !selectedColor || !selectedSeason) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Insert into supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('clothing_items')
        .insert([
          {
            user_id: user?.id,
            name: selectedName,
            image_url: localImageUri,
            category: selectedCategory,
            color: selectedColor,
            style: items.style,
            brand: items.brand,
            season: selectedSeason,
            tags: items.tags
          }
        ])
        .select()
        .single();

      if (insertError) {
        Alert.alert('Error', insertError.message || 'Failed to save item');
        return;
      }

      // If the insertion is successful, upload to Cloudinary
      let cloudinaryUrl = localImageUri;

      if (localImageUri && insertedData) {
        try {
          cloudinaryUrl = await uploadImageToCloudinary(localImageUri, `user_${user.id}_item_${insertedData.id}`);

          // Update the item with the Cloudinary URL
          const { error: updateError } = await supabase
            .from('clothing_items')
            .update({ image_url: cloudinaryUrl })
            .eq('id', insertedData.id);

          if (updateError) {
            console.error('Update error:', updateError);
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Partial Success',
            'Item saved but image upload failed. You can try uploading the image again later.');
        }
      }

      Alert.alert('Success', 'Item saved successfully');
      if (onSuccess) {
        onSuccess();
      }
      onClose();

    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  }

  const isValid = items.name && items.category && items.color && items.season;

  const onChangeItem = (item: string | string[], itemType: keyof newItemType) => {
    setItems(prevItem => ({
      ...prevItem,
      [itemType]: item,
    }));
  };

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
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Add New Item</Text>
          <View style={{ width: 40 }}></View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Upload Image</Text>
            {items.image_url ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: items.image_url }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => onChangeItem('', 'image_url')}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={32} color="#9CA3AF" />
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <Ionicons name="image" size={32} color="#9CA3AF" />
                  <Text style={styles.uploadButtonText}>From Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Blue Denim Jacket"
              placeholderTextColor="#9CA3AF"
              value={items.name}
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
              value={items.brand}
              onChangeText={(text) => onChangeItem(text, 'brand')}
              editable={!loading}
            />
          </View>

          {/* Style Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Style</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Casual, Formal, Streetwear"
              placeholderTextColor="#9CA3AF"
              value={items.style}
              onChangeText={(text) => onChangeItem(text, 'style')}
              editable={!loading}
            />
          </View>

          {/* Tags Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., summer, casual, work (separate with commas)"
              placeholderTextColor="#9CA3AF"
              value={items.tags?.join(', ')}
              onChangeText={(text) => {
                const tagsArray = text.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                onChangeItem(tagsArray, 'tags');
              }}
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
                    items.category === category && styles.optionButtonActive,
                  ]}
                  onPress={() => onChangeItem(category, "category")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      items.category === category && styles.optionTextActive,
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
                    styles.seasonButton,
                    items.season === season && styles.seasonButtonActive,
                  ]}
                  onPress={() => onChangeItem(season, "season")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      items.season === season && styles.seasonTextActive,
                    ]}
                  >
                    {season}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Color *</Text>
            <View style={styles.colorPreview}>
              <View style={[styles.colorBox, { backgroundColor: items.color }]} />
              <Text>{items.color}</Text>
            </View>

            <View style={{ height: 300 }}>
              <ColorPicker
                color={items.color}
                onColorChange={(color) => onChangeItem(color, 'color')}
                thumbSize={30}
                sliderSize={30}
                noSnap={true}
                row={false}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isValid && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Item</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}