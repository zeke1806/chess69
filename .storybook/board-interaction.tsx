import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { createBoardService } from '../src/services/board/board-service';
import { useStatefulService } from '../src/services/adapters/stateful/react-stateful-service';
import type { BoardState } from '../src/services/board/board-types';
import { Chessboard } from '../src/ui/components/business/chessboard';
import { layout } from '../src/ui/components/common/theme';

const boardService = createBoardService();

/** Story-only feature: uses the real board service and connector, without native I/O. */
export function BoardInteraction({ initialState }: Readonly<{ initialState: BoardState }>) {
  const [played, setPlayed] = useState<readonly string[]>([]);
  const { state, actions } = useStatefulService(boardService, {
    play: async (move: string) => {
      setPlayed((previous) => [...previous, move]);
    },
  });

  useEffect(() => {
    actions.synchronize(initialState.context);
    if (initialState.selected) {
      actions.select(initialState.selected);
    }
    if (initialState.promotion.length) {
      actions.select(initialState.promotion[0]!.slice(2, 4));
    }
  }, [actions, initialState]);

  return (
    <View style={layout.stack}>
      <Chessboard state={state} actions={actions} pieceSize={42} />
      <Text accessibilityLiveRegion="polite" style={layout.body}>
        {played.length ? `Coups transmis : ${played.join(' · ')}` : 'Aucun coup transmis'}
      </Text>
    </View>
  );
}
