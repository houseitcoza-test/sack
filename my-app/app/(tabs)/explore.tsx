import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#000000"
          name="house.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">About HouseIt</ThemedText>
      </ThemedView>

      <ThemedText>
        HouseIt connects you with trusted home service professionals in your area. 
        Book services instantly and get quality work done at your convenience.
      </ThemedText>

      <Collapsible title="How it works">
        <ThemedText>
          1. Choose the service you need from our categories
        </ThemedText>
        <ThemedText>
          2. Browse available professionals near you
        </ThemedText>
        <ThemedText>
          3. Select specific services and add them to your cart
        </ThemedText>
        <ThemedText>
          4. Book and confirm your appointment
        </ThemedText>
      </Collapsible>

      <Collapsible title="Available Services">
        <ThemedText>• Electrician services</ThemedText>
        <ThemedText>• Plumbing repairs and installations</ThemedText>
        <ThemedText>• Roofing and exterior work</ThemedText>
        <ThemedText>• Professional painting services</ThemedText>
        <ThemedText>• In-house automotive mechanic</ThemedText>
        <ThemedText>• Home entertainment setup</ThemedText>
        <ThemedText>• Interior design consultation</ThemedText>
      </Collapsible>

      <Collapsible title="Quality Guarantee">
        <ThemedText>
          All service providers on HouseIt are vetted professionals with verified credentials. 
          We guarantee quality work and customer satisfaction.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Pricing">
        <ThemedText>
          Transparent pricing with no hidden fees. See exact costs before booking. 
          Pay securely through the app after service completion.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#FFFFFF',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});