import { useEffect } from 'react';
import { Alert, AppState, BackHandler, useWindowDimensions } from 'react-native';
import type { OrchestrationService } from '../../services/orchestration/orchestration-types';
import { useStatefulService } from '../../services/adapters/stateful/react-stateful-service';
import { ApplicationScreen } from '../components/business/application-screen';

export function ApplicationFeature({ service }: Readonly<{ service: OrchestrationService }>) {
  const { state, actions } = useStatefulService(service);
  const { width } = useWindowDimensions();

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
    <ApplicationScreen
      state={state}
      actions={actions}
      logoSource={require('../components/business/logo.png')}
      pieceSize={Math.min((width - 24) / 8, 60) * 0.9}
    />
  );
}
