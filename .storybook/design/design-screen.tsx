import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette } from './palette';
import {
  DesignArrow,
  DesignBoard,
  DesignBubble,
  DesignButton,
  DesignCard,
  DesignNavigation,
  Illustration,
} from './kit';

export type DesignPage = 'home' | 'learn' | 'exercise' | 'history' | 'analysis';
export type DesignFilter = 'opening' | 'puzzle' | 'endgame';

type Props = Readonly<{
  page: DesignPage;
  selectedCard: string;
  filter: DesignFilter;
  selectedSquare?: string;
  selectedMove: number;
  hintVisible: boolean;
  onNavigate: (page: DesignPage) => void;
  onSelectCard: (card: string) => void;
  onFilter: (filter: DesignFilter) => void;
  onSelectSquare: (square: string) => void;
  onSelectMove: (move: number) => void;
  onToggleHint: () => void;
}>;

const pageTitles: Record<DesignPage, string> = {
  home: 'Votre prochain coup',
  learn: 'Apprendre',
  exercise: 'Trouvez la fourchette',
  history: 'Vos parties',
  analysis: 'Analyse de la partie',
};

const courses = [
  { id: 'italian', title: 'Partie italienne', detail: 'Ouverture · 3 variantes', kind: 'book' },
  { id: 'fork', title: 'La fourchette', detail: 'Tactique · Débutant', kind: 'puzzle' },
  { id: 'rook', title: 'Tour et roi', detail: 'Finale · Débutant', kind: 'rook' },
] as const;

function SectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <Text accessibilityRole="header" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

function CourseRail({ selectedCard, onSelectCard }: Pick<Props, 'selectedCard' | 'onSelectCard'>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
    >
      {courses.map((course) => (
        <View key={course.id} style={styles.courseWidth}>
          <DesignCard selected={selectedCard === course.id} onPress={() => onSelectCard(course.id)}>
            <Illustration kind={course.kind} size={80} />
            <Text style={styles.cardTitle}>{course.title}</Text>
            <Text style={styles.caption}>{course.detail}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.caption}>
                {selectedCard === course.id ? 'Sélectionné' : 'À découvrir'}
              </Text>
              <View style={styles.cardArrow}>
                <DesignArrow color={palette.onAccent} />
              </View>
            </View>
          </DesignCard>
        </View>
      ))}
    </ScrollView>
  );
}

function HomeContent(props: Props) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reprendre la partie"
        onPress={() => props.onNavigate('analysis')}
        style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
      >
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>À vous de jouer.</Text>
          <Text style={styles.heroDetail}>Reprendre votre partie</Text>
          <Text style={styles.heroAction}>Ouvrir l’échiquier</Text>
        </View>
        <Illustration kind="knight" size={112} />
      </Pressable>
      <SectionTitle>Un peu d’entraînement</SectionTitle>
      <CourseRail selectedCard={props.selectedCard} onSelectCard={props.onSelectCard} />
      <DesignButton label="Commencer l’exercice" onPress={() => props.onNavigate('exercise')} />
      <SectionTitle>À votre rythme</SectionTitle>
      <View style={styles.quickLinks}>
        <View style={styles.quickLink}>
          <DesignCard onPress={() => props.onNavigate('learn')}>
            <Illustration kind="book" size={56} />
            <Text style={styles.smallTitle}>Apprendre</Text>
            <Text style={styles.caption}>Ouvrir le catalogue</Text>
          </DesignCard>
        </View>
        <View style={styles.quickLink}>
          <DesignCard onPress={() => props.onNavigate('history')}>
            <Illustration kind="rook" size={56} />
            <Text style={styles.smallTitle}>Mes parties</Text>
            <Text style={styles.caption}>Retrouver un coup</Text>
          </DesignCard>
        </View>
      </View>
    </>
  );
}

function LearnContent(props: Props) {
  const labels = { opening: 'Ouvertures', puzzle: 'Tactique', endgame: 'Finales' };
  const selectedCourse = courses.find((course) => course.id === props.selectedCard) ?? courses[0];
  const filteredCourses =
    props.filter === 'opening'
      ? ['Partie italienne', 'Défense sicilienne', 'Gambit dame']
      : props.filter === 'puzzle'
        ? ['La fourchette', 'Le clouage', 'Attaque double']
        : ['Tour et roi', 'Roi et pion', 'Mater avec une dame'];
  return (
    <>
      <View style={styles.filters}>
        {(['opening', 'puzzle', 'endgame'] as const).map((filter) => (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: props.filter === filter }}
            onPress={() => props.onFilter(filter)}
            style={[styles.filter, props.filter === filter && styles.filterSelected]}
          >
            <Illustration
              kind={filter === 'opening' ? 'book' : filter === 'puzzle' ? 'puzzle' : 'rook'}
              size={58}
            />
            <Text style={[styles.filterText, props.filter === filter && styles.filterTextSelected]}>
              {labels[filter]}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionTitle>À découvrir</SectionTitle>
      <CourseRail selectedCard={props.selectedCard} onSelectCard={props.onSelectCard} />
      <DesignBubble>
        <Text style={styles.bubbleText}>
          {selectedCourse.title} : observez, puis jouez de mémoire.
        </Text>
      </DesignBubble>
      <DesignButton label="Essayer l’exercice" onPress={() => props.onNavigate('exercise')} />
      <SectionTitle>{labels[props.filter]}</SectionTitle>
      {filteredCourses.map((title, index) => (
        <Pressable
          key={title}
          accessibilityRole="button"
          accessibilityLabel={`Découvrir ${title}`}
          onPress={() => props.onSelectCard(`catalogue-${props.filter}-${index}`)}
          style={[
            styles.catalogueRow,
            props.selectedCard === `catalogue-${props.filter}-${index}` && styles.catalogueSelected,
          ]}
        >
          <Text style={styles.smallTitle}>{title}</Text>
          <Text style={styles.caption}>{index === 0 ? 'Débutant' : 'Intermédiaire'}</Text>
        </Pressable>
      ))}
    </>
  );
}

function ExerciseContent(props: Props) {
  return (
    <>
      <View style={styles.inlineMeta}>
        <Text style={styles.caption}>Tactique · Débutant</Text>
        <Text style={styles.caption}>Aux blancs</Text>
      </View>
      <DesignBoard selected={props.selectedSquare} onSelect={props.onSelectSquare} />
      <DesignBubble>
        <Text style={styles.bubbleText}>
          {props.hintVisible
            ? 'Le cavalier peut attaquer deux pièces à la fois.'
            : 'Quel coup crée une double menace ?'}
        </Text>
      </DesignBubble>
      <Text accessibilityLiveRegion="polite" style={styles.caption}>
        {props.selectedSquare
          ? `Case ${props.selectedSquare} sélectionnée · aperçu`
          : 'Touchez une case pour voir la sélection.'}
      </Text>
      <View style={styles.actionPair}>
        <View style={styles.actionHalf}>
          <DesignButton
            label={props.hintVisible ? 'Masquer l’indice' : 'Un indice'}
            secondary
            onPress={props.onToggleHint}
          />
        </View>
        <View style={styles.actionHalf}>
          <DesignButton label="Voir l’analyse" onPress={() => props.onNavigate('analysis')} />
        </View>
      </View>
      <SectionTitle>Un autre exercice</SectionTitle>
      <CourseRail selectedCard={props.selectedCard} onSelectCard={props.onSelectCard} />
    </>
  );
}

function HistoryContent(props: Props) {
  return (
    <>
      <DesignBubble>
        <Text style={styles.bubbleText}>Un coup à revoir ? Retrouvez-le ici.</Text>
      </DesignBubble>
      <SectionTitle>Aujourd’hui</SectionTitle>
      <DesignCard onPress={() => props.onNavigate('analysis')}>
        <View style={styles.historyMain}>
          <View style={styles.miniBoard}>
            <DesignBoard compact />
          </View>
          <View style={styles.historyCopy}>
            <Text style={styles.cardTitle}>Partie italienne</Text>
            <Text style={styles.caption}>Vous · Niveau débutant</Text>
            <Text style={styles.result}>Partie nulle</Text>
            <Text style={styles.caption}>24 coups · 14:32</Text>
          </View>
        </View>
        <View style={styles.historyAction}>
          <Text style={styles.accentText}>Revoir la partie</Text>
          <Text style={styles.caption}>½ – ½</Text>
        </View>
      </DesignCard>
      <SectionTitle>Hier</SectionTitle>
      {[
        { title: 'Défense sicilienne', result: 'Victoire', moves: '31 coups', score: '1 – 0' },
        { title: 'Une partie à revoir', result: 'Défaite', moves: '18 coups', score: '0 – 1' },
      ].map((game) => (
        <DesignCard key={game.title} onPress={() => props.onNavigate('analysis')}>
          <View style={styles.historyRow}>
            <View>
              <Text style={styles.smallTitle}>{game.title}</Text>
              <Text style={styles.caption}>
                {game.result} · {game.moves}
              </Text>
            </View>
            <Text style={styles.accentText}>{game.score}</Text>
          </View>
        </DesignCard>
      ))}
    </>
  );
}

const moves = ['e4', 'e5', 'Cf3', 'Cc6', 'Fc4', 'Fc5', 'd3', 'Cf6'] as const;

function AnalysisContent(props: Props) {
  return (
    <>
      <View style={styles.inlineMeta}>
        <Text style={styles.caption}>Partie italienne · Partie nulle</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => props.onNavigate('history')}
          style={styles.backLink}
        >
          <Text style={styles.accentText}>Historique</Text>
        </Pressable>
      </View>
      <View style={styles.analysisBoard}>
        <View
          style={styles.evaluation}
          accessibilityLabel="Évaluation illustrative : plus 0,3 pion"
        >
          <View style={styles.evaluationDark} />
          <View style={styles.evaluationLight} />
        </View>
        <View style={styles.boardFill}>
          <DesignBoard selected={props.selectedSquare} onSelect={props.onSelectSquare} />
        </View>
      </View>
      <View style={styles.moveTransport}>
        <DesignButton
          label="Précédent"
          secondary
          disabled={props.selectedMove === 0}
          onPress={() => props.onSelectMove(props.selectedMove - 1)}
        />
        <Text style={styles.caption}>
          {props.selectedMove + 1} / {moves.length}
        </Text>
        <DesignButton
          label="Suivant"
          secondary
          disabled={props.selectedMove === moves.length - 1}
          onPress={() => props.onSelectMove(props.selectedMove + 1)}
        />
      </View>
      <View style={styles.analysisInsight}>
        <Text style={styles.evalNumber}>+0,3</Text>
        <View style={styles.insightCopy}>
          <Text style={styles.smallTitle}>Une position équilibrée</Text>
          <Text style={styles.caption}>Évaluation de démonstration</Text>
        </View>
      </View>
      <DesignBubble>
        <Text style={styles.bubbleText}>
          {props.selectedMove < 4
            ? 'Développez vos pièces vers le centre.'
            : 'Préparez le roque pour mettre le roi à l’abri.'}
        </Text>
      </DesignBubble>
      <SectionTitle>Les coups joués</SectionTitle>
      <View style={styles.moves}>
        {moves.map((move, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Coup ${index + 1} : ${move}`}
            accessibilityState={{ selected: props.selectedMove === index }}
            onPress={() => props.onSelectMove(index)}
            style={[styles.move, props.selectedMove === index && styles.moveSelected]}
          >
            <Text
              style={[styles.moveNumber, props.selectedMove === index && styles.moveLabelSelected]}
            >
              {Math.floor(index / 2) + 1}
              {index % 2 === 0 ? '.' : '…'}
            </Text>
            <Text
              style={[styles.moveLabel, props.selectedMove === index && styles.moveLabelSelected]}
            >
              {move}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.caption}>Aperçu du lecteur de coups, sans moteur d’analyse.</Text>
    </>
  );
}

export function DesignScreen(props: Props) {
  const active =
    props.page === 'learn'
      ? 'learn'
      : props.page === 'exercise'
        ? 'play'
        : props.page === 'history' || props.page === 'analysis'
          ? 'progress'
          : 'home';
  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Chess69</Text>
        <Text style={styles.previewLabel}>Référence intégrée</Text>
      </View>
      <ScrollView
        key={props.page}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text accessibilityRole="header" style={styles.title}>
          {pageTitles[props.page]}
        </Text>
        {props.page === 'home' && <HomeContent {...props} />}
        {props.page === 'learn' && <LearnContent {...props} />}
        {props.page === 'exercise' && <ExerciseContent {...props} />}
        {props.page === 'history' && <HistoryContent {...props} />}
        {props.page === 'analysis' && <AnalysisContent {...props} />}
      </ScrollView>
      <DesignNavigation
        active={active}
        onNavigate={(destination) =>
          props.onNavigate(
            destination === 'play'
              ? 'exercise'
              : destination === 'progress'
                ? 'history'
                : destination,
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', backgroundColor: palette.background },
  brandRow: {
    minHeight: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  previewLabel: { color: palette.muted, fontSize: 12 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 14 },
  title: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 0,
    letterSpacing: -0.3,
  },
  hero: {
    backgroundColor: palette.accent,
    borderRadius: 24,
    padding: 20,
    minHeight: 156,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  pressed: { opacity: 0.85 },
  heroCopy: { flex: 1, gap: 8 },
  heroTitle: {
    fontFamily: 'Chess69Display',
    color: palette.onAccent,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroDetail: { color: palette.onAccent, fontSize: 14, lineHeight: 20 },
  heroAction: {
    color: palette.onAccent,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
  rail: { gap: 12, paddingBottom: 8, paddingRight: 4 },
  courseWidth: { width: 198 },
  cardTitle: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginTop: 8,
  },
  smallTitle: {
    fontFamily: 'Chess69Display',
    color: palette.ink,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },
  bubbleText: { color: palette.ink, fontSize: 14, lineHeight: 21 },
  caption: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinks: { flexDirection: 'row', gap: 12 },
  quickLink: { flex: 1 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: {
    flex: 1,
    minHeight: 104,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    paddingVertical: 10,
    gap: 7,
  },
  filterSelected: {
    backgroundColor: palette.selected,
    borderWidth: 1,
    borderColor: palette.accent,
  },
  filterText: { color: palette.muted, fontSize: 13, fontWeight: '700' },
  filterTextSelected: { color: palette.ink },
  catalogueRow: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderColor: palette.border,
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  catalogueSelected: { backgroundColor: palette.selected, borderRadius: 12, paddingHorizontal: 12 },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionPair: { flexDirection: 'row', gap: 10 },
  actionHalf: { flex: 1 },
  historyMain: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  miniBoard: { width: 112 },
  historyCopy: { flex: 1, gap: 5 },
  result: { color: palette.accent, fontSize: 16, fontWeight: '700', marginTop: 7 },
  historyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    minHeight: 32,
  },
  accentText: { color: palette.accent, fontSize: 13, fontWeight: '700' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'center',
    minHeight: 48,
  },
  backLink: { minHeight: 48, justifyContent: 'center' },
  analysisBoard: { flexDirection: 'row', gap: 8 },
  evaluation: { width: 7, overflow: 'hidden', borderRadius: 5 },
  evaluationDark: { flex: 0.47, backgroundColor: palette.raised },
  evaluationLight: { flex: 0.53, backgroundColor: palette.boardLight },
  boardFill: { flex: 1 },
  moveTransport: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  analysisInsight: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 6 },
  evalNumber: {
    fontFamily: 'Chess69Display',
    color: palette.accent,
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  insightCopy: { flex: 1, gap: 4 },
  moves: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  move: {
    width: '23%',
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.card,
  },
  moveSelected: { backgroundColor: palette.accent },
  moveNumber: { fontSize: 12, color: palette.muted },
  moveLabel: { fontSize: 15, fontWeight: '700', color: palette.ink },
  moveLabelSelected: { color: palette.onAccent },
});
