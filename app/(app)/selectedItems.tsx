import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { Colors } from "theme";
import { Button, ButtonText, Icon } from "@gluestack-ui/themed";
import { StarIcon } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { formatNumber } from "#helpers/format";
import { Item } from "#types";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SelectedItemsScreen = () => {
  const { selectedItems } = useLocalSearchParams();
  const router = useRouter();

  const items: Item[] = selectedItems ? JSON.parse(selectedItems as string) : [];

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <GestureHandlerRootView style={styles.flex1}>
      <View style={styles.container}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollViewContent}
        >
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(index * 20)}
              exiting={FadeOutUp}
              style={styles.rowContent}
            >
              <Image source={{ uri: item.owner.avatar_url }} style={styles.avatar} />

              <View style={styles.itemDetails}>
                <Text>{item.owner.login}</Text>
                <AnimatedTouchableOpacity onPress={() => openLink(item.html_url)}>
                  <Text style={styles.textGray}>{item.full_name}</Text>
                </AnimatedTouchableOpacity>
                <View style={styles.row}>
                  <Text>{formatNumber(item.stargazers_count)}</Text>
                  <Icon as={StarIcon} size="md" ml="$1" color={Colors.yellow} />
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
        <View style={styles.buttonNavigate}>
          <Button style={styles.button} onPress={() => router.navigate("/")} testID="ok">
            <ButtonText style={styles.textWhite}>OK</ButtonText>
          </Button>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    paddingBottom: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    margin: 30,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '90%',
    marginVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 8,
    marginVertical: 2,
  },
  textGray: {
    color: 'gray',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  buttonNavigate: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 30, 
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  textWhite: {
    color: 'white',
  },
});

export default SelectedItemsScreen;
