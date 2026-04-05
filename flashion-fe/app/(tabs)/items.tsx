import { useEffect, useState } from "react";
import { View, 
        Text,
        StyleSheet,
        ScrollView,
        TouchableOpacity,
        TextInput,
        Dimensions, 
        Modal} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from "@/utils/supabase";
import { Image } from "expo-image";
import AddItemModal from "@/_components/AddItemModal";

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 24 padding on each side + 24 between items

export type clothingType = {
    id: number,
    category: string,
    color: string,
    style: string,
    brand: string,
    tags: string[],
    image_url: string,
    name: string,
    user_id:string,
    season: string,
    favorite: boolean,
}

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];


export default function Items(){
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<clothingType[]>([]);
    const [favorites, setfavorites] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);

    const deleteItem = async (itemId:number | null)=>{
        if (itemId === null) return;
        const {data, error} = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);
        if(error){
            alert('Error deleting item: ' + error.message);
        } else {
            setItems(items.filter(item => item.id !== itemId));
        }
    }

    useEffect(()=>{
        // Fetch items from backend and setItems
        const fetchItems = async () => {
            
            const { data, error} = await supabase
            .from('clothing_items')
            .select('*')
            .eq('user_id', user?.id);

            if(error){
                alert('Error fetching items: ' + error.message);
            }
            
            setItems(data || []);

            setfavorites(data?.filter((item) => item.favorite).map(item => item.id) || []);
        };
        fetchItems();
    },[])



    const userName = user?.user_metadata?.name || "User";
    const toggleFavorite = async (itemId:number)=>{
        if (favorites.includes(itemId)){
            setfavorites(favorites.filter(id => id !== itemId));
            
            // Here you would also want to update the backend to reflect the change in favorite status
            const {data, error} = await supabase
            .from('clothing_items')
            .update({favorite: false})
            .eq('id', itemId);

            if(error){
                alert('Error updating favorite status: ' + error.message);
            }
            console.log('Updated item:', data);
        } else {
            setfavorites([...favorites, itemId]);
        }
    }

    const filteredItems = items.filter(item=>{
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    })

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#FAF9F6',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 16,
        },
        greeting: {
            fontSize: 14,
            color: '#6B7280',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1F2937',
            marginTop: 4,
        },
        headerIcons: {
            flexDirection: 'row',
            gap: 12,
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFF',
            justifyContent: 'center',
            alignItems: 'center',
        },
        progressContainer: {
            paddingHorizontal: 24,
            marginBottom: 24,
        },
        progressBar: {
            height: 4,
            backgroundColor: '#E5E7EB',
            borderRadius: 2,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: '#E07A5F',
            borderRadius: 2,
        },
        progressText: {
            fontSize: 12,
            color: '#6B7280',
            marginTop: 8,
        },
        searchContainer: {
            flexDirection: 'row',
            paddingHorizontal: 24,
            gap: 12,
            marginBottom: 24,
        },
        searchBar: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: '#1F2937',
        },
        filterButton: {
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#1F2937',
            justifyContent: 'center',
            alignItems: 'center',
        },
        categoriesContainer: {
            maxHeight: 50,
            marginBottom: 16,
        },
        categoriesContent: {
            paddingHorizontal: 24,
            gap: 12,
        },
        categoryTab: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24,
            backgroundColor: '#FFF',
        },
        categoryTabActive: {
            backgroundColor: '#1F2937',
        },
        categoryText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
        },
        categoryTextActive: {
            color: '#FFF',
        },
        itemsCount: {
            fontSize: 14,
            color: '#6B7280',
            paddingHorizontal: 24,
            marginBottom: 16,
        },
        itemsContainer: {
            flex: 1,
        },
        itemsContent: {
            paddingHorizontal: 12,
            paddingBottom: 100,
        },
        itemsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between', // ← Add this!
    
        },
        itemCard: {
            width: ITEM_WIDTH,
            marginBottom: 16,
        },
        itemImage: {
            width: '100%',
            height: ITEM_WIDTH * 1.4,
            borderRadius: 12,
            backgroundColor: '#E5E7EB',
        },
        favoriteButton: {
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        colorBadge: {
            position: 'absolute',
            bottom: 60,
            left: 12,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        colorText: {
            fontSize: 10,
            fontWeight: '700',
            color: '#1F2937',
        },
        deleteButton: {
            position: 'absolute',
            bottom: 60,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center'
        },
        itemInfo: {
            marginTop: 8,
        },
        itemName: {
            fontSize: 14,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 4,
        },
        itemCategory: {
            fontSize: 12,
            color: '#6B7280',
        },
        addButton: {
            position: 'absolute',
            bottom: 95,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#E07A5F',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
    });



    return (
        <>
            <View style={styles.container}>
                {/**Headers */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Morning</Text>
                        <Text style={styles.title}>{userName}'s Wardrobe</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="person-circle-outline" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                </View>


                {/**Search and Filter */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Search your wardrobe..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                            />
                    </View>
                </View>

                {/**Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                    >
                    {CATEGORIES.map(category=>(
                        <TouchableOpacity
                            key={category}
                            style={[styles.categoryTab, selectedCategory === category && styles.categoryTabActive]}
                            onPress={()=>setSelectedCategory(category)}
                        >
                            
                            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>{category}</Text>
                        </TouchableOpacity>
                    ))}

                </ScrollView>
                {/**Items Count */}
                <Text style={styles.itemsCount}>{filteredItems.length} items found</Text>

                {/* Items Grid */}
                <ScrollView
                    style={styles.itemsContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.itemsContent}
                >
                    <View style={styles.itemsGrid}>
                    {filteredItems.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                        <Image source={{ uri: item.image_url }} style={styles.itemImage} contentFit={"cover"} cachePolicy={"memory-disk"}/>
                        
                        {/* Favorite Button */}
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(item.id)}
                        >
                            <Ionicons
                            name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                            size={20}
                            color={favorites.includes(item.id) ? '#EF4444' : '#FFF'}
                            />
                        </TouchableOpacity>

                        {/* Color Badge */}
                        <View style={styles.colorBadge}>
                            <Text style={styles.colorText}>{item.color}</Text>
                        </View>

                        {/**Delete Button */}
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => {setSelectedItemId(item.id) 
                                            setShowDeleteModal(true)
                                        }}
                        >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>

                        {/* Item Info */}
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                            </Text>
                            <Text style={styles.itemCategory}>{item.category}</Text>
                        </View>
                        </View>
                    ))}
                    </View>
                </ScrollView>

                {/* Add Button */}
                <TouchableOpacity style={styles.addButton} onPress={()=>setShowAddModal(true)}>
                    <Ionicons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>
            
            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                animationType="fade"
                transparent = {true}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: 300, padding: 20, backgroundColor: '#FFF', borderRadius: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Delete Item</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Are you sure you want to delete this item?</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                                <Text style={{ color: '#6B7280' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                deleteItem(selectedItemId);
                                setShowDeleteModal(false);
                                setSelectedItemId(null);
                            }} style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#EF4444', borderRadius: 8 }}>
                                <Text style={{ color: '#FFF' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/**Manually Add Item Modal */}
            <AddItemModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
        </>

    )
}