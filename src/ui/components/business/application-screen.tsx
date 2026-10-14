import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type {
  OrchestrationState,
  OrchestrationActions,
} from '../../../services/orchestration/orchestration-types';
import { ApplicationShell } from './application-shell';
import { HomeScreen } from './home-screen';
import { LearnScreen } from './learn-screen';
import { OpeningScreen } from './opening-screen';
import { ExerciseScreen } from './exercise-screen';
import { PlayScreen } from './play-screen';
import { GameScreen } from './game-screen';
import { HistoryScreen } from './history-screen';
import { AnalysisScreen } from './analysis-screen';
import { ProgressScreen } from './progress-screen';
import { Chessboard } from './chessboard';

export type ApplicationScreenProps = Readonly<{
  state: OrchestrationState;
  actions: OrchestrationActions;
  logoSource: ImageSourcePropType;
  pieceSize: number;
}>;

/** Presentation shared by Android and Storybook; state and effects live in the feature. */
export function ApplicationScreen({
  state,
  actions,
  logoSource,
  pieceSize,
}: ApplicationScreenProps) {
  const board = <Chessboard state={state.board} actions={actions.board} pieceSize={pieceSize} />;
  return (
    <ApplicationShell
      state={state.shell}
      logoSource={logoSource}
      onNavigate={actions.navigate}
      onBack={actions.back}
      onRetry={actions.retry}
    >
      {renderPage(state, actions, board)}
    </ApplicationShell>
  );
}

function renderPage(
  state: OrchestrationState,
  actions: OrchestrationActions,
  board: ReactNode,
): ReactNode {
  const { page, destination } = state.shell.route;
  if (page === 'opening') {
    return <OpeningScreen state={state.learning} actions={actions.learning} />;
  }
  if (page === 'exercise') {
    return <ExerciseScreen state={state.learning} actions={actions.learning} board={board} />;
  }
  if (page === 'game') {
    return (
      <GameScreen
        state={state.game}
        actions={actions.game}
        board={board}
        onHome={() => actions.navigate('home')}
        onAnalysis={actions.analysis.open}
      />
    );
  }
  if (page === 'history') {
    return <HistoryScreen state={state.game} onAnalysis={actions.analysis.open} />;
  }
  if (page === 'analysis') {
    return <AnalysisScreen state={state.analysis} actions={actions.analysis} board={board} />;
  }
  if (destination === 'learn') {
    return <LearnScreen state={state.learning} actions={actions.learning} />;
  }
  if (destination === 'play') {
    return <PlayScreen state={state.game} actions={actions.game} />;
  }
  if (destination === 'progress') {
    return (
      <ProgressScreen
        state={state.progression}
        onExercise={actions.learning.startExercise}
        onHistory={actions.game.showHistory}
      />
    );
  }
  return (
    <HomeScreen
      state={{ ...state.progression, activeGame: state.game.activeGame }}
      events={{
        onOnboard: actions.progression.dismissOnboarding,
        onRecommended: actions.startRecommendedPractice,
        onPractice: actions.openPractice,
        onResume: actions.game.resume,

        onPlay: () => {
          actions.navigate('play');
        },
      }}
    />
  );
}
