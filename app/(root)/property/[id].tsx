import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import icons from "@/constants/icons";
import images from "@/constants/images";
import Comment from "@/components/Comment";
import FarmMap from "@/components/FarmMap";
import BookingSheet from "@/components/BookingSheet";
import { facilities } from "@/constants/data";

import { useSupabase } from "@/lib/useSupabase";
import { getPropertyById } from "@/lib/supabase";
import { formatINR } from "@/lib/currency";
import { Booking, useShoppingList } from "@/lib/shopping-list";

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const windowHeight = Dimensions.get("window").height;

  // Fetching property data from Supabase
  const { data: property, loading } = useSupabase({
    fn: getPropertyById,
    params: {
      id: id!,
    },
  });

  const { addProduct, bookProduct, items, total, budget } = useShoppingList();
  const [bookingOpen, setBookingOpen] = useState(false);
  // Feedback shown above the action buttons after booking or adding to the list.
  const [notice, setNotice] = useState<{ title: string; text: string; warning?: boolean } | null>(null);

  const confirmBooking = (booking: Booking) => {
    if (!property) return;
    const order = bookProduct(property.name, booking);
    setBookingOpen(false);
    setNotice({
      title: "Booking confirmed",
      text: `${booking.quantity} × ${property.name} · ${formatINR(order.total)} · ${booking.paymentMode}. See it in My Orders.`,
    });
  };

  const addToList = () => {
    if (!property || property.price == null) return;
    const newTotal = Math.round((total + property.price) * 100) / 100;
    addProduct({ id: property.id, name: property.name, price: property.price });
    setNotice(
      newTotal > budget
        ? {
            title: "Added to your list",
            text: `Your list is now ${formatINR(Math.round((newTotal - budget) * 100) / 100)} over your ${formatINR(budget)} limit, so Buy All is unavailable until it's back under.`,
            warning: true,
          }
        : { title: "Added to your list", text: `List total ${formatINR(newTotal)} of ${formatINR(budget)}.` }
    );
  };

  // Checking if the property data exists
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <Ionicons name="eye-off-outline" size={40} color="#9CA3AF" />
            <Text style={styles.noPreviewTitle}>No preview available</Text>
            <Text style={styles.noPreviewText}>This product isn't in the shop anymore.</Text>
            <TouchableOpacity style={[styles.bookButton, { marginTop: 16 }]} onPress={() => router.back()}>
              <Text style={styles.bookButtonText}>Go back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

 

  const priced = property.price != null;
  const inList = items.find((item) => item.productId === property.id)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Image section */}
        <View style={[styles.imageContainer, { height: windowHeight / 2 }]}>
          <Image
            source={{ uri: property?.image ?? undefined }}
            style={styles.fullSizeImage}
            resizeMode="cover"
          />
          

          <View style={[styles.headerContainer, { top: Platform.OS === "android" ? 70 : 20 }]}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Image source={icons.backArrow} style={styles.backArrow} />
              </TouchableOpacity>

              <View style={styles.headerIcons}>
                <Image
                  source={icons.heart}
                  style={styles.iconSize}
                  tintColor="#191D31"
                />
                <Image source={icons.send} style={styles.iconSize} />
              </View>
            </View>
          </View>
        </View>

        {/* Property details */}
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyName}>{property?.name}</Text>

          <View style={styles.propertyMeta}>
            <View style={styles.propertyType}>
              <Text style={styles.propertyTypeText}>{property?.type}</Text>
            </View>

            <View style={styles.propertyRating}>
              <Image source={icons.star} style={styles.iconSize} />
              <Text style={styles.ratingText}>
                {property?.rating} ({property?.reviews.length} reviews)
              </Text>
            </View>
          </View>

          {/* Property Information */}
          <ScrollView horizontal>
          <View style={styles.propertyInfo}>
            {property.fertilizers_percentage && (
              <View style={styles.infoItem}>
                <View style={styles.container}>
                  <Image source={icons.bed} style={styles.iconSize} />
                </View>
                <Text style={styles.infoText}>{property.fertilizers_percentage} Fertilizers</Text>
              </View>
            )}

            {property.pesticides_insecticides && (
              <View style={styles.infoItem}>
                <View style={styles.container}>
                  <Image source={icons.bath} style={styles.iconSize} />
                </View>
                <Text style={styles.infoText}>{property.pesticides_insecticides} Pesticides</Text>
              </View>
            )}
          </View>
          </ScrollView>
          {/* Agent Information */}
          <View style={styles.agentSection}>
            <Text style={styles.agentTitle}>Seller</Text>
            <View style={styles.agentInfo}>
              <View style={styles.agentInfoLeft}>
                <Image
                  source={{ uri: property?.agent?.avatar ?? undefined }}
                  style={styles.agentAvatar}
                />
                <View style={styles.agentDetails}>
                  <Text style={styles.agentName}>{property?.agent?.name}</Text>
                  <Text style={styles.agentEmail}>{property?.agent?.email}</Text>
                </View>
              </View>

              <View style={styles.agentActions}>
                <Image source={icons.chat} style={styles.iconSize} />
                <Image source={icons.phone} style={styles.iconSize} />
              </View>
            </View>
          </View>

          {/* Overview */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{property?.description}</Text>
          </View>

          {/* Facilities */}
          <View style={styles.facilitiesSection}>
            <Text style={styles.sectionTitle}>Delivery & Payment</Text>
            {property?.facilities.length > 0 && (
              <View style={styles.facilitiesList}>
                {property?.facilities.map((item, index) => {
                  const facility = facilities.find(
                    (facility) => facility.title === item
                  );
                  return (
                    <View key={index} style={styles.facilityItem}>
                      <View style={styles.facilityIconContainer}>
                        <Image
                          source={facility ? facility.icon : icons.info}
                          style={styles.facilityIcon}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.facilityText}
                      >
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Gallery */}
          {property?.galleries.length > 0 && (
            <View style={styles.gallerySection}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                contentContainerStyle={styles.galleryList}
                data={property?.galleries}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.galleryImage}
                  />
                )}
              />
            </View>
          )}

          {/* Location */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Farm Location</Text>
            <View style={styles.locationInfo}>
              <Image source={icons.location} style={styles.locationIcon} />
              <Text style={styles.locationText}>{property?.address}</Text>
            </View>

            {property.latitude != null && property.longitude != null ? (
              <FarmMap
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.name}
                address={property.address}
              />
            ) : (
              <Image
                source={images.map}
                style={styles.mapImage}
              />
            )}
          </View>

          {/* Reviews */}
          {property?.reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <View style={styles.reviewsLeft}>
                  <Image source={icons.star} style={styles.iconSize} />
                  <Text style={styles.reviewsText}>
                    {property?.rating} ({property?.reviews.length} reviews)
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.commentSection}>
                <Comment item={property?.reviews[0]} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Section */}
      <View style={styles.bookSection}>
        {notice && (
          <View style={[styles.confirmation, notice.warning && styles.confirmationWarning]}>
            <Ionicons
              name={notice.warning ? "warning" : "checkmark-circle"}
              size={22}
              color={notice.warning ? "#F75555" : "#4CAF50"}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.confirmationTitle}>{notice.title}</Text>
              <Text style={[styles.confirmationText, notice.warning && styles.listStatusOver]}>{notice.text}</Text>
            </View>
          </View>
        )}

        <View style={styles.bookSectionContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>{formatINR(property.price)}</Text>
          </View>
          {inList > 0 && <Text style={styles.inListText}>{inList} in your list</Text>}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary, !priced && styles.actionDisabled]}
            disabled={!priced}
            onPress={() => setBookingOpen(true)}
            accessibilityLabel="Book this product"
          >
            <Ionicons name="calendar-outline" size={18} color="white" />
            <Text style={styles.actionTextLight}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionOutline, !priced && styles.actionDisabled]}
            disabled={!priced}
            onPress={addToList}
            accessibilityLabel="Add product to shopping list"
          >
            <Ionicons name="add-circle-outline" size={18} color="#4CAF50" />
            <Text style={styles.actionTextGreen}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionDark]}
            onPress={() => router.push("/shopping-list")}
            accessibilityLabel="Go to the shopping list to buy all items"
          >
            <Ionicons name="bag-check-outline" size={18} color="white" />
            <Text style={styles.actionTextLight}>Buy All{items.length > 0 ? ` (${items.length})` : ""}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BookingSheet
        visible={bookingOpen}
        product={{ id: property.id, name: property.name, price: property.price ?? 0 }}
        onClose={() => setBookingOpen(false)}
        onConfirm={confirmBooking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    // Room for the action bar fixed at the bottom.
    paddingBottom: 200,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  fullSizeImage: {
    width: "100%",
    height: "100%",
  },
  whiteGradient: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 40,
  },
  headerContainer: {
    position: "absolute",
    left: 7,
    right: 7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50", // Primary color
    borderRadius: 50,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    width: 20,
    height: 20,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconSize: {
    width: 20,
    height: 20,
  },
  propertyDetails: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  propertyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  propertyType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#E0F2FE", // Primary light background color
    borderRadius: 50,
  },
  propertyTypeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CAF50", // Primary color
  },
  propertyRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#4B5563", // Text color
    marginTop: 5,
  },
  propertyInfo: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE", // Light background color
    borderRadius: 50,
    padding: 10,
    gap: 25,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563", // Text color
    marginLeft: 5,
  },
  agentSection: {
    marginTop: 20,
  },
  agentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563", // Text color
  },
  agentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  agentInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  agentDetails: {
    marginLeft: 15,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563", // Text color
  },
  agentEmail: {
    fontSize: 14,
    color: "#6B7280", // Text color
  },
  agentActions: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  overviewSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563", // Text color
  },
  description: {
    fontSize: 16,
    color: "#6B7280", // Text color
    marginTop: 10,
  },
  facilitiesSection: {
    marginTop: 20,
  },
  facilitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 30,
    marginTop: 10,
  },
  facilityItem: {
    width: "25%",
    alignItems: "center",
  },
  facilityIconContainer: {
    backgroundColor: "#E0F2FE", // Light background color
    borderRadius: 50,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  facilityIcon: {
    width: 30,
    height: 30,
  },
  facilityText: {
    fontSize: 12,
    color: "#4B5563", // Text color
    marginTop: 10,
    textAlign: "center",
  },
  gallerySection: {
    marginTop: 20,
  },
  galleryList: {
    gap: 10,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  locationSection: {
    marginTop: 20,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
  },
  locationText: {
    fontSize: 16,
    color: "#4B5563", // Text color
    marginLeft: 10,
  },
  mapImage: {
    width: "100%",
    height: 200,
    marginTop: 10,
  },
  reviewsSection: {
    marginTop: 20,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewsText: {
    fontSize: 16,
    color: "#4B5563", // Text color
    marginLeft: 5,
  },
  viewAllText: {
    fontSize: 14,
    color: "#3B82F6", // Primary color
  },
  commentSection: {
    marginTop: 10,
  },
  bookSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
  },
  inListText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionPrimary: {
    backgroundColor: "#4CAF50",
  },
  actionOutline: {
    borderWidth: 1.5,
    borderColor: "#4CAF50",
    backgroundColor: "white",
  },
  actionDark: {
    backgroundColor: "#191D31",
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionTextLight: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
  },
  actionTextGreen: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  confirmationWarning: {
    backgroundColor: "#FDECEC",
  },
  noPreviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191D31",
    marginTop: 10,
  },
  noPreviewText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  confirmation: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#F1FAF1",
  },
  confirmationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#191D31",
  },
  confirmationText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  listStatusOver: {
    color: "#F75555",
  },
  bookSectionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B5563", // Text color
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50", // Primary color
    marginLeft: 5,
  },
  bookButton: {
    backgroundColor: "#4CAF50", // Primary color
    borderRadius: 50,
    padding: 15,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default Property;
