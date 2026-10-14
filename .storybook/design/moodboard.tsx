import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignBubble, DesignButton, DesignCard, DesignNavigation, Illustration } from './kit';
import { palette } from './palette';

type MoodboardProps = {
  readonly onSampleAction: () => void;
  readonly onNavigate: (destination: 'home' | 'learn' | 'play' | 'progress') => void;
};

const swatches = [
  { name: 'Charbon', color: palette.background, ink: palette.ink },
  { name: 'Feutre', color: palette.card, ink: palette.ink },
  { name: 'Ivoire', color: palette.ink, ink: palette.background },
  { name: 'Sauge', color: palette.accent, ink: palette.onAccent },
] as const;

export function Moodboard({ onSampleAction, onNavigate }: MoodboardProps) {
  return (
    <ScrollView style={styles.surface} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>Charbon & sauge</Text>
          <Text style={styles.body}>Le jeu prend du relief.</Text>
        </View>
        <Illustration kind="knight" size={126} />
      </View>

      <View style={styles.swatches}>
        {swatches.map((swatch) => (
          <View key={swatch.name} style={[styles.swatch, { backgroundColor: swatch.color }]}>
            <Text style={[styles.swatchName, { color: swatch.ink }]}>{swatch.name}</Text>
            <Text style={[styles.hex, { color: swatch.ink }]}>{swatch.color.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.typeSpecimen}>
        <Text style={styles.sectionTitle}>Un coup d’avance.</Text>
        <Text style={styles.body}>Quelques mots. Une action claire.</Text>
      </View>
      <DesignBubble>
        <Text style={styles.body}>Une piste, au bon moment.</Text>
      </DesignBubble>

      <Text style={styles.sectionTitle}>Matière & volume</Text>
      <View style={styles.illustrations}>
        <Illustration kind="book" size={92} />
        <Illustration kind="puzzle" size={92} />
        <Illustration kind="rook" size={92} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}
      >
        <View style={styles.sampleCard}>
          <DesignCard selected onPress={onSampleAction}>
            <Illustration kind="book" size={78} />
            <Text style={styles.cardTitle}>Apprendre</Text>
            <Text style={styles.caption}>Sélectionné · 5 min</Text>
          </DesignCard>
        </View>
        <View style={styles.sampleCard}>
          <DesignCard onPress={onSampleAction}>
            <Illustration kind="puzzle" size={78} />
            <Text style={styles.cardTitle}>S’exercer</Text>
            <Text style={styles.caption}>Au repos · 3 min</Text>
          </DesignCard>
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>À portée de pouce</Text>
      <DesignButton label="Continuer" onPress={onSampleAction} />
      <View style={styles.buttonRow}>
        <View style={styles.buttonCell}>
          <DesignButton label="Plus tard" secondary onPress={onSampleAction} />
        </View>
        <View style={styles.buttonCell}>
          <DesignButton label="Indisponible" disabled onPress={onSampleAction} />
        </View>
      </View>
      <DesignNavigation active="home" onNavigate={onNavigate} />
      <Text style={styles.note}>Référence approuvée · intégrée</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  heroCopy: { flex: 1, gap: 12 },
  title: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  body: { color: palette.muted, fontSize: 15, lineHeight: 22 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: '47%',
    minHeight: 90,
    padding: 14,
    borderRadius: 18,
    justifyContent: 'flex-end',
    gap: 5,
  },
  swatchName: { fontFamily: 'Chess69Display', fontSize: 16, lineHeight: 22, fontWeight: '700' },
  hex: { fontSize: 12, lineHeight: 18 },
  typeSpecimen: { gap: 6, marginTop: 12 },
  sectionTitle: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    marginTop: 12,
  },
  illustrations: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRow: { gap: 14, paddingBottom: 8 },
  sampleCard: { width: 174 },
  cardTitle: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginTop: 10,
  },
  caption: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  buttonCell: { flex: 1 },
  note: { color: palette.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
