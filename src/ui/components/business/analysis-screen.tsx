import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Button } from '../common/button';
import { Panel } from '../common/panel';
import { layout } from '../common/theme';
import type { AnalysisState, AnalysisActions } from '../../../services/analysis/analysis-types';
import { levels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: AnalysisState;
  actions: Pick<AnalysisActions, 'selectPly' | 'cancel' | 'analyze'>;
  board: ReactNode;
}>;

export function AnalysisScreen({ state, actions, board }: ScreenProps) {
  const session = state.session;
  const details = state.details;
  if (!session || !state.position || !details) {
    return null;
  }
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>Analyse de la partie</Text>
      <Text style={layout.muted}>
        {session.record.result} · {levels[session.record.level]} ·{' '}
        {new Date(session.record.startedAt).toLocaleDateString('fr-FR')}
      </Text>
      {board}
      <View style={layout.row}>
        <Button
          label="Précédent"
          secondary
          disabled={state.selectedPly === 0}
          onPress={() => actions.selectPly(state.selectedPly - 1)}
        />
        <Text style={layout.body}>
          {state.selectedPly} / {session.record.moves.length}
        </Text>
        <Button
          label="Suivant"
          secondary
          disabled={state.selectedPly === session.record.moves.length}
          onPress={() => actions.selectPly(state.selectedPly + 1)}
        />
      </View>
      <Panel>
        <Text style={layout.body}>{details.evaluationMessage}</Text>
        {details.bestMoveMessage && <Text style={layout.body}>{details.bestMoveMessage}</Text>}
        {details.continuationMessage && (
          <Text style={layout.muted}>{details.continuationMessage}</Text>
        )}
        {details.assessmentMessage && <Text style={layout.body}>{details.assessmentMessage}</Text>}
      </Panel>
      <Text accessibilityLiveRegion="polite" style={layout.body}>
        {details.statusMessage}
      </Text>
      {state.analyzing ? (
        <Button label="Annuler l’analyse" secondary onPress={actions.cancel} />
      ) : (
        <Button
          label={details.actionLabel}
          onPress={actions.analyze}
          disabled={state.busy || state.view?.record.complete}
        />
      )}
      <Text style={layout.muted}>
        Écarts : imprécision à partir de 0,5 pion, erreur à partir de 1 pion, grosse erreur à partir
        de 2 pions. Les annonces de mat sont traitées séparément. Une analyse rapide guide
        l’apprentissage ; ses évaluations peuvent varier avec le calcul.
      </Text>
      <Text style={layout.section}>Les coups joués</Text>
      {state.position.history.map((move, index) => (
        <Text style={layout.body} key={index}>
          {Math.floor(index / 2) + 1}
          {index % 2 === 0 ? '.' : '…'} {move}
        </Text>
      ))}
    </View>
  );
}
