import { Text, View } from 'react-native';
import { ActionRow } from '../common/action-row';
import { layout } from '../common/theme';
import type { GameState } from '../../../services/game/game-types';
import { levels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: Pick<GameState, 'history'>;
  onAnalysis: (id: string) => void;
}>;

export function HistoryScreen({ state, onAnalysis }: ScreenProps) {
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>Vos parties</Text>
      {state.history.length === 0 && (
        <Text style={layout.body}>
          Vos parties terminées apparaîtront ici. Jouez une partie contre Stockfish pour commencer.
        </Text>
      )}
      {state.history.map((session) => (
        <ActionRow
          key={session.record.id}
          title={`${session.record.result ?? 'Partie'} · ${levels[session.record.level]}`}
          detail={`${new Date(session.record.startedAt).toLocaleDateString('fr-FR')} · ${session.record.moves.length} demi-coups · toucher pour parcourir et analyser`}
          onPress={() => onAnalysis(session.record.id)}
        />
      ))}
    </View>
  );
}
