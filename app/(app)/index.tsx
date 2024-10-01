import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  CurvedTransition,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Input, InputField, Button, ButtonText } from "@gluestack-ui/themed";
import { Colors } from "theme";
import { Icon } from "@gluestack-ui/themed";
import { TrashIcon, StarIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import SwipeableRow from "#components/SwipeableRow";
import { getRepositories } from "#services/api";
import { Item, ApiResponse } from "#types";
import { formatNumber } from "#helpers/format";
import { isValid } from "#helpers/validation";

const transition = CurvedTransition.delay(100);

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const HomeScreen = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [activeItems, setActiveItems] = useState<number[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();
  const editing = useSharedValue(-30);

  useEffect(() => {
    getRepositories()
      .then((data: ApiResponse) => {
        const repos = data.items
          .slice(0, 20)
          .sort((a, b) => b.stargazers_count - a.stargazers_count);
        setItems(repos);
        setFilteredItems(repos);
        const totalStarsCount = repos.reduce(
          (acc, repo) => acc + repo.stargazers_count,
          0
        );
        setTotalStars(totalStarsCount);
      })
      .catch((error) => {
        console.error("Error", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setShowButton(activeItems.length > 0);
  }, [activeItems]);

  useEffect(() => {
    if (searchError) {
      const timer = setTimeout(() => {
        setSearchError(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchError]);

  const searchInput = (text: string) => {
    setSearchText(text);
    const error = isValid(text);
    setSearchError(error);
    if (!error) {
      const filtered = items.filter((item) =>
        item.full_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
      const totalStarsCount = filtered.reduce(
        (acc, repo) => acc + repo.stargazers_count,
        0
      );
      setTotalStars(totalStarsCount);
    } else {
      setFilteredItems([]);
      setTotalStars(0);
    }
  };

  const removeItem = (toDelete: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(items.filter((item) => item.id !== toDelete.id));
    setFilteredItems(filteredItems.filter((item) => item.id !== toDelete.id));
    setActiveItems((prev) => prev.filter((id) => id !== toDelete.id));
  };

  const toggleActiveItem = (id: number) => {
    setActiveItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const animatedRowStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(editing.value) }],
  }));

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const navigateToSelectedItems = () => {
    const selectedItems = items.filter((item) => activeItems.includes(item.id));

    router.push({
      pathname: "/selectedItems",
      params: { selectedItems: JSON.stringify(selectedItems) },
    });
  };

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <View style={styles.content}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.contentContainer}
        >
          <View style={Platform.OS === "android" ? { marginTop: 40 } : {}}>
            <Input
              style={styles.input}
              variant="outline"
              size="md"
              isDisabled={false}
              isInvalid={!!searchError}
              isReadOnly={false}
            >
              <InputField
                placeholder="Search"
                value={searchText}
                onChangeText={searchInput}
              />
            </Input>
          </View>
          {searchError && <Text style={styles.errorText}>{searchError}</Text>}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            searchText && (
              <Animated.View layout={transition}>
                <Animated.FlatList
                  skipEnteringExitingAnimations
                  data={filteredItems}
                  scrollEnabled={false}
                  itemLayoutAnimation={transition}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item, index }) => (
                    <SwipeableRow onDelete={() => removeItem(item)}>
                      <AnimatedTouchableOpacity
                        onPress={() => toggleActiveItem(item.id)}
                        style={[
                          styles.row,
                          animatedRowStyles,
                          activeItems.includes(item.id) && styles.activeRow,
                        ]}
                      >
                        <Animated.View
                          entering={FadeInUp.delay(index * 20)}
                          exiting={FadeOutUp}
                          style={styles.rowContent}
                        >
                          <Image
                            source={{ uri: item.owner.avatar_url }}
                            style={styles.avatar}
                          />

                          <View style={styles.styleView}>
                            <Text>{item.owner.login}</Text>
                            <AnimatedTouchableOpacity
                              onPress={() => openLink(item.html_url)}
                            >
                              <Text style={styles.fullname}>
                                {item.full_name}
                              </Text>
                            </AnimatedTouchableOpacity>
                            <View style={{ flexDirection: "row" }}>
                              <Text>{formatNumber(item.stargazers_count)}</Text>
                              <Icon
                                as={StarIcon}
                                size="md"
                                ml="$1"
                                color={Colors.yellow}
                              />
                            </View>
                          </View>

                          {activeItems.includes(item.id) && (
                            <AnimatedTouchableOpacity
                              style={styles.iconContainer}
                              onPress={() => removeItem(item)}
                            >
                              <Icon as={TrashIcon} size="lg" ml="$2" />
                            </AnimatedTouchableOpacity>
                          )}
                        </Animated.View>
                      </AnimatedTouchableOpacity>
                    </SwipeableRow>
                  )}
                />
                {filteredItems.length > 0 && (
                  <View style={styles.totalStarsContainer}>
                    <Text style={styles.totalStarsText}>
                      {formatNumber(totalStars)}
                    </Text>
                    <Icon
                      as={StarIcon}
                      size="md"
                      ml="$1"
                      color={Colors.yellow}
                    />
                  </View>
                )}
              </Animated.View>
            )
          )}
          {showButton && (
            <View
              style={styles.containerButton}
            >
              <Button
                style={styles.button}
                onPress={navigateToSelectedItems}
                testID="selected"
              >
                <ButtonText style={styles.buttonText} testID="selected text">
                  Ver elementos seleccionados
                </ButtonText>
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  styleView: {
    flex: 1,
    marginLeft: 12,
    marginVertical: 2,
  },
  fullname: {
    color: Colors.gray1,
    flex: 1,
    margin: 4,
    fontWeight: 400,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginLeft: 30,
    borderRadius: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  activeRow: {
    backgroundColor: Colors.secondary,
    marginLeft: 40,
  },
  removeButton: {
    paddingLeft: 8,
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  containerButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginVertical: 8,
    marginLeft: 8,
  },
  iconContainer: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "center",
  },
  totalStarsContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  totalStarsText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 10,
    width: 300,
    ...(Platform.OS === "android" && {
      paddingVertical: 6,
    }),
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
    ...(Platform.OS === "android" && {
      width: "100%",
    }),
  },
  input: {
    height: 40,
    paddingHorizontal: 16,
    margin: 8,
    color: Colors.white,
    backgroundColor: Colors.gray,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  errorText: {
    color: Colors.red,
    marginLeft: 16,
  },
});

export default HomeScreen;
