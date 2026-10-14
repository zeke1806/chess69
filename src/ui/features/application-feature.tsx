import { useEffect } from 'react';
import { Alert, AppState, BackHandler, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import type {
  OrchestrationService,
  OrchestrationState,
  OrchestrationActions,
} from '../../services/orchestration/orchestration-types';
import { useStatefulService } from '../../services/adapters/stateful/react-stateful-service';
import { ApplicationShell } from '../components/business/application-shell';
import { HomeScreen } from '../components/business/home-screen';
import { LearnScreen } from '../components/business/learn-screen';
import { OpeningScreen } from '../components/business/opening-screen';
import { ExerciseScreen } from '../components/business/exercise-screen';
import { PlayScreen } from '../components/business/play-screen';
import { GameScreen } from '../components/business/game-screen';
import { HistoryScreen } from '../components/business/history-screen';
import { AnalysisScreen } from '../components/business/analysis-screen';
import { ProgressScreen } from '../components/business/progress-screen';
import { Chessboard } from '../components/business/chessboard';

export function ApplicationFeature({ service }: Readonly<{ service: OrchestrationService }>) {
  const { state, actions } = useStatefulService(service);
  const { width } = useWindowDimensions();
  const board = (
    <Chessboard
      state={state.board}
      actions={actions.board}
      pieceSize={Math.min((width - 24) / 8, 60) * 0.9}
    />
  );

  useEffect(() => {
    void actions.initialize();
    const back = BackHandler.addEventListener('hardwareBackPress', actions.back);
    const app = AppState.addEventListener('change', (value) => {
      if (value === 'active') {
        void actions.foreground();
      }
    });
    return () => {
      back.remove();
      app.remove();
      void actions.dispose().catch(() => undefined);
    };
  }, [actions]);

  useEffect(() => {
    if (!state.game.replacementRequired) {
      return;
    }
    Alert.alert(
      'Remplacer la partie en cours ?',
      'La partie actuelle sera abandonnée et conservée dans l’historique.',
      [
        { text: 'Garder ma partie', style: 'cancel', onPress: actions.game.dismissReplacement },
        {
          text: 'Abandonner et commencer',
          style: 'destructive',

          onPress: () => {
            void actions.game.start(true);
          },
        },
      ],
      { cancelable: true, onDismiss: actions.game.dismissReplacement },
    );
  }, [state.game.replacementRequired, actions.game]);

  useEffect(() => {
    if (!state.game.resignationRequired) {
      return;
    }
    Alert.alert(
      'Abandonner cette partie ?',
      'Elle restera consultable et analysable dans votre historique.',
      [
        { text: 'Continuer', style: 'cancel', onPress: actions.game.dismissResign },
        {
          text: 'Abandonner',
          style: 'destructive',

          onPress: () => {
            void actions.game.confirmResign();
          },
        },
      ],
      { cancelable: true, onDismiss: actions.game.dismissResign },
    );
  }, [state.game.resignationRequired, actions.game]);

  return (
    <ApplicationShell
      state={state.shell}
      logoSource={require('../components/business/logo.png')}
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
