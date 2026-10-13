import { useEffect, useRef } from 'react';
import { Alert, AppState, BackHandler } from 'react-native';
import type { GameOptions } from '../../services-business/game/game-type';
import { ApplicationScreen } from '../components/application/application-screen';
import { useServicesFront } from './services-front-provider';

export function ApplicationFeature(){
  const {applicationService,reactService}=useServicesFront();
  const state=reactService.useApplicationState(applicationService);
  const pendingOptions=useRef<GameOptions|null>(null);
  useEffect(()=>{
    void applicationService.initialize();
    const back=BackHandler.addEventListener('hardwareBackPress',applicationService.back);
    const app=AppState.addEventListener('change',(value)=>{if(value==='active')void applicationService.foreground();});
    return ()=>{back.remove();app.remove();};
  },[applicationService]);
  useEffect(()=>{
    if(!state.replacementRequired||!pendingOptions.current)return;
    Alert.alert('Remplacer la partie en cours ?','La partie actuelle sera abandonnée et conservée dans l’historique.',[
      {text:'Garder ma partie',style:'cancel',onPress:applicationService.dismissReplacement},
      {text:'Abandonner et commencer',style:'destructive',onPress:()=>{if(pendingOptions.current)void applicationService.startGame(pendingOptions.current,true);}},
    ],{cancelable:true,onDismiss:applicationService.dismissReplacement});
  },[state.replacementRequired,applicationService]);
  return <ApplicationScreen state={state} events={{
    onNavigate:applicationService.navigate,onBack:applicationService.back,onRetry:()=>{void applicationService.retry();},
    onOnboard:()=>{void applicationService.dismissOnboarding();},onFilter:applicationService.filter,
    onOpening:applicationService.openOpening,onExercise:applicationService.startExercise,
    onExerciseMove:(move)=>{void applicationService.exerciseMove(move);},onHint:applicationService.hint,onReveal:()=>{void applicationService.reveal();},
    onStartGame:(options)=>{pendingOptions.current=options;void applicationService.startGame(options);},
    onResume:()=>{void applicationService.resumeGame();},onGameMove:(move)=>{void applicationService.gameMove(move);},
    onResign:()=>Alert.alert('Abandonner cette partie ?','Elle restera consultable et analysable dans votre historique.',[{text:'Continuer',style:'cancel'},{text:'Abandonner',style:'destructive',onPress:()=>{void applicationService.resign();}}]),
    onHistory:()=>{void applicationService.showHistory();},onAnalysis:(id)=>{void applicationService.openAnalysis(id);},
    onAnalyze:()=>{void applicationService.analyze();},onCancelAnalysis:()=>{void applicationService.cancelAnalysis();},onPly:applicationService.selectPly,
  }}/>;
}
