import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { clothingType } from "./items";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

const FILTERS: Array<{
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap | null;
}> = [
  { id: "All", label: "All", icon: null },
  { id: "Casual", label: "Casual", icon: "sunny" },
  { id: "Work", label: "Work", icon: "briefcase" },
  { id: "Evening", label: "Evening", icon: "moon" },
  { id: "Sport", label: "Sport", icon: "fitness" },
];

export type Outfit = {
  id: number;
  name: string;
  category: string;
  itemCount: number;
  items: clothingType[];
};

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function Outfits() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [favourites, setFavourites] = useState<number[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const { user } = useAuth();

  const filteredOutfits =
    selectedFilter === "All"
      ? outfits
      : outfits.filter((o) => o.category === selectedFilter);

  const currentOutfit = filteredOutfits[currentIndex] ?? filteredOutfits[0];

  const fetchOutfits = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/outfits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id, filter: selectedFilter }),
        }
      );
      const responseData = await response.json();
      const data = responseData.data;
      

      setOutfits(data);

      console.log("Current ourfits:", currentOutfit);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching outfits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : filteredOutfits.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < filteredOutfits.length - 1 ? prev + 1 : 0
    );
  };

  const handleSave = (id: number) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerateOutfits = async () => {
    setGenerating(true);
    const body = {
      userId: user?.id,
      filter: selectedFilter,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-outfits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setOutfits(data.outfits);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error generating outfits:", error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchOutfits();
    }
  }, [user, selectedFilter]);

  // Build 2x2 grid layout for outfit images
  const renderOutfitGrid = (items: clothingType[]) => {
    const count = items.length;

    if (count === 1) {
      return (
        <View style={styles.gridContainer}>
          <Image
            source={{ uri: items[0].image_url }}
            style={styles.gridSingle}
            resizeMode="cover"
          />
        </View>
      );
    }

    if (count === 2) {
      return (
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {items.map((item, i) => (
              <Image
                key={i}
                source={{ uri: item.image_url }}
                style={styles.gridHalf}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      );
    }

    if (count === 3) {
      return (
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {/* Left: large */}
            <Image
              source={{ uri: items[0].image_url }}
              style={styles.gridLeft}
              resizeMode="cover"
            />
            {/* Right: two stacked */}
            <View style={styles.gridRightStack}>
              <Image
                source={{ uri: items[1].image_url }}
                style={styles.gridStackItem}
                resizeMode="cover"
              />
              <Image
                source={{ uri: items[2].image_url }}
                style={styles.gridStackItem}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      );
    }

    // 4+ items: 2x2 grid
    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          {items.slice(0, 2).map((item, i) => (
            <Image
              key={i}
              source={{ uri: item.image_url }}
              style={styles.gridQuarter}
              resizeMode="cover"
            />
          ))}
        </View>
        <View style={styles.gridRow}>
          {items.slice(2, 4).map((item, i) => (
            <Image
              key={i}
              source={{ uri: item.image_url }}
              style={styles.gridQuarter}
              resizeMode="cover"
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={22} color="#E07A5F" />
          <Text style={styles.title}>Outfit Suggestions</Text>
        </View>
        <Text style={styles.subtitle}>
          AI-powered outfit recommendations just for you
        </Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filtersRow}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => {
              setSelectedFilter(filter.id);
              setCurrentIndex(0);
            }}
          >
            {filter.icon && (
              <Ionicons
                name={filter.icon as "apps"}
                size={14}
                color={selectedFilter === filter.id ? "#FFF" : "#6B7280"}
              />
            )}
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main scrollable content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Outfit Card */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#E07A5F"
            style={{ marginTop: 60 }}
          />
        ) : currentOutfit ? (
          <View style={styles.outfitCard}>
            {/* Image Grid */}
            <View style={styles.imageSection}>
              {renderOutfitGrid(currentOutfit.items)}

              {/* Navigation Arrows */}
              {filteredOutfits.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.navArrow, styles.navArrowLeft]}
                    onPress={handlePrevious}
                  >
                    <Ionicons name="chevron-back" size={20} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navArrow, styles.navArrowRight]}
                    onPress={handleNext}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#1F2937"
                    />
                  </TouchableOpacity>
                </>
              )}

              {/* Dot Indicators */}
              {filteredOutfits.length > 1 && (
                <View style={styles.dotsContainer}>
                  {filteredOutfits.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentIndex
                          ? styles.dotActive
                          : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Outfit Info */}
            <View style={styles.outfitInfo}>
              <View style={styles.outfitHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.outfitName}>{currentOutfit.name}</Text>
                  <Text style={styles.outfitMeta}>
                    {currentOutfit.itemCount} items ·{" "}
                    {FILTERS.find((f) => f.id === currentOutfit.category)
                      ?.label ?? currentOutfit.category}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSave(currentOutfit.id)}
                  style={[
                    styles.saveButton,
                    favourites.includes(currentOutfit.id) &&
                      styles.saveButtonActive,
                  ]}
                >
                  <Ionicons
                    name={
                      favourites.includes(currentOutfit.id)
                        ? "heart"
                        : "heart-outline"
                    }
                    size={20}
                    color={
                      favourites.includes(currentOutfit.id)
                        ? "#FFF"
                        : "#6B7280"
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Item Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContent}
              >
                {currentOutfit.items.map((item, index) => (
                  <View key={index} style={styles.itemPill}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.pillImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.pillText} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Outfits Found</Text>
            <Text style={styles.emptyText}>
              Try a different filter or generate new outfits
            </Text>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, generating && { opacity: 0.8 }]}
          onPress={handleGenerateOutfits}
          disabled={generating}
        >
          {generating ? (
            <>
              <ActivityIndicator
                color="#FFF"
                size="small"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="refresh"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.generateButtonText}>Generate New Outfit</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/**Reset button */}
        <TouchableOpacity onPress={fetchOutfits}>
            <Text style={{ color: "#E07A5F", textAlign: "center", marginBottom: 16 }}>Refresh Outfits</Text>
        </TouchableOpacity>
        

        {/* Saved Outfits Card */}
        <View style={styles.savedCard}>
          <View>
            <Text style={styles.savedLabel}>Saved Outfits</Text>
            <Text style={styles.savedNumber}>{favourites.length}</Text>
          </View>
          <Ionicons name="heart" size={32} color="#E07A5F" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const CARD_SIZE = width - 32;
const HALF = (CARD_SIZE - 4) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  filtersRow: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    maxHeight: 52,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    gap: 4,
    marginRight: 4,
  },
  filterButtonActive: {
    backgroundColor: "#1F2937",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // --- Outfit Card ---
  outfitCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },

  // --- Image Grid ---
  imageSection: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
  },
  gridContainer: {
    flex: 1,
    gap: 2,
    padding: 2,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: 2,
  },
  gridSingle: {
    flex: 1,
    borderRadius: 14,
  },
  gridHalf: {
    flex: 1,
    borderRadius: 14,
  },
  gridLeft: {
    flex: 1,
    borderRadius: 14,
  },
  gridRightStack: {
    flex: 1,
    gap: 2,
  },
  gridStackItem: {
    flex: 1,
    borderRadius: 14,
  },
  gridQuarter: {
    flex: 1,
    borderRadius: 14,
  },

  // --- Navigation Arrows ---
  navArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  navArrowLeft: {
    left: 12,
  },
  navArrowRight: {
    right: 12,
  },

  // --- Dot Indicators ---
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: "#E07A5F",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  // --- Outfit Info ---
  outfitInfo: {
    padding: 16,
  },
  outfitHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  outfitMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonActive: {
    backgroundColor: "#E07A5F",
  },

  // --- Item Pills ---
  pillsContent: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  itemPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  pillImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    maxWidth: 100,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },

  // --- Generate Button ---
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E07A5F",
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 12,
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },

  // --- Saved Card ---
  savedCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  savedLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  savedNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
  },
});