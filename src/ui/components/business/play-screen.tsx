import { Text, View } from 'react-native';
import { Button } from '../common/button';
import { Choice } from '../common/choice';
import { layout } from '../common/theme';
import type { GameState, GameActions } from '../../../services/game/game-types';
import type { GameOptions } from '../../../services-business/game/game-types';
import { levels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: GameState;
  actions: Pick<GameActions, 'resume' | 'changeColor' | 'changeLevel' | 'start' | 'showHistory'>;
}>;

export function PlayScreen({ state, actions }: ScreenProps) {
  const { color, level } = state.options;
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>Jouer contre Stockfish</Text>
      <Text style={layout.body}>Une partie à votre rythme, entièrement sur le téléphone.</Text>
      {state.activeGame && <Button label="Reprendre ma partie" onPress={actions.resume} />}
      <Text style={layout.section}>Votre camp</Text>
      <View style={layout.row}>
        {(
          [
            ['w', 'Blancs'],
            ['b', 'Noirs'],
            ['random', 'Au hasard'],
          ] as const
        ).map(([value, label]) => (
          <Choice
            key={value}
            label={label}
            selected={color === value}
            onPress={() => actions.changeColor(value)}
          />
        ))}
      </View>
      <Text style={layout.section}>Difficulté</Text>
      <View style={layout.row}>
        {(Object.keys(levels) as GameOptions['level'][]).map((value) => (
          <Choice
            key={value}
            label={levels[value]}
            selected={level === value}
            onPress={() => actions.changeLevel(value)}
          />
        ))}
      </View>
      <Text style={layout.muted}>
        Découverte aide à prendre vos marques ; Club demande plus de précision. Ces niveaux
        décrivent le réglage du moteur, sans classement officiel.
      </Text>
      <Button
        label="Commencer une partie"
        onPress={() => {
          void actions.start();
        }}
        disabled={state.busy}
      />
      <Button label="Historique et analyse" secondary onPress={actions.showHistory} />
      <Text style={layout.muted}>
        Nulle automatique après trois répétitions, 50 coups sans prise ni mouvement de pion, pat ou
        matériel insuffisant.
      </Text>
    </View>
  );
}
