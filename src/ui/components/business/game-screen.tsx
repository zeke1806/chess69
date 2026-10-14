import { Text, View, ActivityIndicator } from 'react-native';
import type { ReactNode } from 'react';
import { Button } from '../common/button';
import { colors, layout } from '../common/theme';
import type { GameState, GameActions } from '../../../services/game/game-types';
import { levels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: GameState;
  actions: Pick<GameActions, 'requestResign'>;
  onHome: () => void;
  onAnalysis: (id: string) => void;
  board: ReactNode;
}>;

export function GameScreen({ state, actions, onHome, onAnalysis, board }: ScreenProps) {
  const session = state.session;
  if (!session) {
    return <Text style={layout.body}>La partie est sauvegardée. Retrouvez-la dans Jouer.</Text>;
  }
  const ended = Boolean(session.record.finishedAt);
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>{ended ? 'Partie terminée' : 'Votre partie'}</Text>
      <Text style={layout.muted}>
        Stockfish · {levels[session.record.level]} · vous jouez les{' '}
        {session.record.color === 'w' ? 'blancs' : 'noirs'}
      </Text>
      {board}
      {state.thinking && <ActivityIndicator color={colors.primary} />}
      <Text accessibilityLiveRegion="polite" style={layout.body}>
        {state.message}
      </Text>
      <Text style={layout.muted}>
        {session.position.history
          .map((move, index) => `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ''}${move}`)
          .join(' ') || 'Les blancs commencent.'}
      </Text>
      {ended ? (
        <Button label="Analyser cette partie" onPress={() => onAnalysis(session.record.id)} />
      ) : (
        <>
          <Button label="Revenir à l’accueil · partie sauvegardée" secondary onPress={onHome} />
          <Button
            label="Abandonner la partie"
            secondary
            onPress={actions.requestResign}
            disabled={state.busy}
          />
        </>
      )}
    </View>
  );
}
