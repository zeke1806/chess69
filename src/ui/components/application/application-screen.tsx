import { NavigationIcon } from './navigation-icon';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ApplicationSnapshot, Destination } from '../../../services-front/application/application-type';
import type { Exercise } from '../../../services-business/catalogue/catalogue-type';
import type { GameOptions } from '../../../services-business/game/game-type';
import { Chessboard } from './chessboard';
import { Button, Choice, Panel } from './controls';
import { colors, layout } from './theme';

type Events = Readonly<{
  onNavigate:(destination:Destination)=>void;onBack:()=>void;onRetry:()=>void;onOnboard:()=>void;
  onFilter:(kind:Exercise['kind'],theme?:string|null,difficulty?:Exercise['difficulty']|null)=>void;
  onOpening:(id:string)=>void;onExercise:(id:string,color?:'w'|'b',guided?:boolean)=>void;
  onExerciseMove:(move:string)=>void;onHint:()=>void;onReveal:()=>void;
  onStartGame:(options:GameOptions)=>void;onResume:()=>void;onGameMove:(move:string)=>void;onResign:()=>void;
  onHistory:()=>void;onAnalysis:(id:string)=>void;onAnalyze:()=>void;onCancelAnalysis:()=>void;onPly:(ply:number)=>void;
}>;
type ScreenProps = Readonly<{state:ApplicationSnapshot;events:Events}>;
const kindLabels={opening:'Ouvertures',puzzle:'Puzzles',endgame:'Finales'};
const levels={beginner:'Découverte',casual:'Amateur',club:'Club'};
const destinationLabels={home:'Accueil',learn:'Apprendre',play:'Jouer',progress:'Progrès'};
const accessibilityDestinations={...destinationLabels,progress:'Progression'};

export function ApplicationScreen({state,events}:ScreenProps){
  const nested=state.page!=='list';
  const context=state.page==='exercise'&&state.learning?kindLabels[state.learning.exercise.kind]
    :state.page==='opening'?'Ouvertures':state.page==='game'?'Partie contre Stockfish'
    :state.page==='history'?'Historique':state.page==='analysis'?'Analyse locale'
    :state.destination==='home'?'Chess69':state.destination==='progress'?'Progression':destinationLabels[state.destination];
  return <SafeAreaView style={styles.screen} edges={['top','bottom']}>
    <View style={styles.topbar}>
      {nested?<Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={events.onBack} android_ripple={{color:'#FFFFFF20'}} style={styles.backButton}><NavigationIcon kind="back" color={colors.onSurface}/></Pressable>:<Image source={require('./logo.png')} style={styles.logo} accessibilityLabel="Logo Chess69"/>}
      <Text accessibilityRole="header" numberOfLines={1} style={styles.brand}>{context}</Text>
      {nested?<Image source={require('./logo.png')} style={styles.smallLogo} accessibilityLabel="Logo Chess69"/>:<Text style={layout.muted}>v{state.version}</Text>}
    </View>
    <ScrollView key={`${state.destination}:${state.page}:${state.opening?.id??''}:${state.learning?.exercise.id??''}`} contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        {state.status==='loading'&&<View style={styles.loading}><ActivityIndicator color={colors.primary}/><Text style={layout.body}>Préparation des données locales et du moteur…</Text></View>}
        {state.error&&<View accessibilityLiveRegion="polite" style={styles.error}><Text style={[layout.body,{color:colors.error}]}>{state.error}</Text><Button label="Réessayer" secondary onPress={events.onRetry}/></View>}
        {state.status==='ready'&&<>
          {state.page==='opening'?<OpeningScreen state={state} events={events}/>
            :state.page==='exercise'?<ExerciseScreen state={state} events={events}/>
            :state.page==='game'?<GameScreen state={state} events={events}/>
            :state.page==='history'?<HistoryScreen state={state} events={events}/>
            :state.page==='analysis'?<AnalysisScreen state={state} events={events}/>
            :state.destination==='home'?<HomeScreen state={state} events={events}/>
            :state.destination==='learn'?<LearnScreen state={state} events={events}/>
            :state.destination==='play'?<PlayScreen state={state} events={events}/>
            :<ProgressScreen state={state} events={events}/>}
        </>}
      </View>
    </ScrollView>
    <View accessibilityRole="tablist" style={styles.navigation}>{(Object.keys(destinationLabels) as Destination[]).map((destination)=><Pressable key={destination} accessibilityRole="tab" accessibilityLabel={accessibilityDestinations[destination]} accessibilityState={{selected:state.destination===destination}} onPress={()=>events.onNavigate(destination)} android_ripple={{color:'#FFFFFF20'}} style={styles.navItem}><View collapsable={false} style={[styles.navIndicator,state.destination===destination&&styles.navSelected]}><NavigationIcon kind={destination} color={state.destination===destination?colors.primary:colors.muted}/></View><Text numberOfLines={1} style={[styles.navLabel,state.destination===destination&&styles.navLabelSelected]}>{destinationLabels[destination]}</Text></Pressable>)}</View>
  </SafeAreaView>;
}

function HomeScreen({state,events}:ScreenProps){
  const summary=state.summary;const due=summary?.due??[];
  return <View style={layout.stack}>
    <Text accessibilityRole="header" style={layout.title}>Votre prochain coup</Text>
    <Text style={layout.body}>Un peu de pratique aujourd’hui, de meilleurs réflexes demain.</Text>
    {state.onboarding&&<Panel><Text style={layout.section}>Bienvenue à l’échiquier</Text><Text style={layout.body}>Touchez une pièce, puis sa destination. Les cases marquées indiquent les coups légaux. Apprenez une ouverture avec le guide, puis rejouez-la de mémoire. Les indices vous aident, et le résultat distingue les réussites sans aide.</Text><Button label="J’ai compris" onPress={events.onOnboard} disabled={state.busy}/></Panel>}
    <View style={styles.focus}><Text style={styles.focusTitle}>{due.length?`${due.length} révision${due.length>1?'s':''} à travailler`:'Prêt à progresser ?'}</Text><Text style={[layout.body,{color:colors.onPrimary}]}>{due.length?'Retrouvez les variantes arrivées à échéance.':'Découvrez une ouverture, puis testez votre mémoire.'}</Text><Button label={due.length?'Commencer la révision':'Découvrir les ouvertures'} secondary onPress={()=>due[0]?events.onExercise(due[0].contentId,due[0].color):events.onNavigate('learn')}/></View>
    {state.activeGame&&<Panel><Text style={layout.body}>Votre partie contre Stockfish vous attend.</Text><Button label="Reprendre la partie" onPress={events.onResume}/></Panel>}
    <Text style={layout.section}>Votre pratique</Text>
    <Text style={layout.body}>{summary?.successes??0} réussites sans aide · {summary?.streak??0} jour{summary?.streak===1?'':'s'} de suite</Text>
    <ActionRow title="Résoudre un puzzle" detail="Calculer une séquence, comprendre une idée" onPress={()=>{events.onNavigate('learn');events.onFilter('puzzle');}}/>
    <ActionRow title="Travailler une finale" detail="Mats, pions et tours" onPress={()=>{events.onNavigate('learn');events.onFilter('endgame');}}/>
    <ActionRow title="Jouer contre Stockfish" detail="Trois niveaux, sans pendule" onPress={()=>events.onNavigate('play')}/>
    <Text style={layout.muted}>Tout fonctionne sur ce téléphone, sans compte ni connexion. La progression est conservée après fermeture et mise à jour. Désinstaller ou effacer les données la supprime.</Text>
  </View>;
}
function LearnScreen({state,events}:ScreenProps){
  const themes=state.kind==='puzzle'?['Mat','Fourchette','Clouage','Enfilade','Attaque à la découverte','Élimination du défenseur']:state.kind==='endgame'?['Mat élémentaire','Finale de pions','Finale de tours']:[];
  return <View style={layout.stack}><Text accessibilityRole="header" style={layout.title}>Apprendre</Text><View style={layout.row}>{(['opening','puzzle','endgame'] as const).map((kind)=><Choice key={kind} label={kindLabels[kind]} selected={state.kind===kind} onPress={()=>events.onFilter(kind)}/>)}</View>
    {state.kind==='opening'?<><Text style={layout.body}>Explorez les idées d’une ouverture, puis entraînez votre camp de mémoire.</Text>{state.openings.map((opening)=><ActionRow key={opening.id} title={opening.title} detail={`${opening.variationIds.length} variantes · ${opening.description}`} onPress={()=>events.onOpening(opening.id)}/>)}</>:<>
      <Text style={layout.body}>Trouvez toute la suite. Votre adversaire répond automatiquement. Un indice ou une solution reste une tentative avec aide.</Text>
      <Text style={layout.muted}>Filtrer par difficulté</Text><View style={layout.row}><Choice label="Toutes" selected={!state.difficulty} onPress={()=>events.onFilter(state.kind,state.theme,null)}/><Choice label="Débutant" selected={state.difficulty==='beginner'} onPress={()=>events.onFilter(state.kind,state.theme,'beginner')}/><Choice label="Intermédiaire" selected={state.difficulty==='intermediate'} onPress={()=>events.onFilter(state.kind,state.theme,'intermediate')}/></View>
      <Text style={layout.muted}>Filtrer par thème</Text><View style={layout.row}><Choice label="Tous" selected={!state.theme} onPress={()=>events.onFilter(state.kind,null,state.difficulty)}/>{themes.map((theme)=><Choice key={theme} label={theme} selected={state.theme===theme} onPress={()=>events.onFilter(state.kind,theme,state.difficulty)}/>)}</View>
      <Text style={layout.section}>{state.catalogue.length} exercices</Text>{state.catalogue.length===0&&<Text style={layout.body}>Aucun exercice avec ces filtres. Choisissez « Tous » et « Toutes ».</Text>}{state.catalogue.map((exercise)=><ActionRow key={exercise.id} title={exercise.title} detail={`${exercise.theme} · ${exercise.difficulty==='beginner'?'Débutant':'Intermédiaire'}`} onPress={()=>events.onExercise(exercise.id)}/>)}</>}
  </View>;
}
function OpeningScreen({state,events}:ScreenProps){
  const [color,setColor]=useState<'w'|'b'>('w');const opening=state.opening;if(!opening)return null;
  return <View style={layout.stack}><Text style={layout.title}>{opening.title}</Text><Text style={layout.body}>{opening.description}</Text><Text style={layout.section}>Les idées à retenir</Text>{opening.ideas.map((idea)=><Text key={idea} style={layout.body}>• {idea}</Text>)}<Text style={layout.section}>Les pièges à éviter</Text>{opening.mistakes.map((idea)=><Text key={idea} style={layout.body}>• {idea}</Text>)}<View style={layout.row}><Choice label="Travailler les blancs" selected={color==='w'} onPress={()=>setColor('w')}/><Choice label="Travailler les noirs" selected={color==='b'} onPress={()=>setColor('b')}/></View>{opening.variationIds.map((id)=>{
    const exercise=state.catalogue.find((item)=>item.id===id);return <Panel key={id}><Text style={layout.body}>{exercise?.title??id}</Text><Button label="Explorer avec le guide" secondary onPress={()=>events.onExercise(id,color,true)}/><Button label="Jouer de mémoire" onPress={()=>events.onExercise(id,color,false)}/></Panel>;
  })}</View>;
}
function ExerciseScreen({state,events}:ScreenProps){
  const session=state.learning;if(!session)return null;const done=session.status!=='playing';
  return <View style={layout.stack}><Text style={layout.title}>{session.exercise.title}</Text><Text style={layout.muted}>{session.exercise.theme} · {session.mode==='guided'?'Mode guidé':'De mémoire'} · {session.color==='w'?'Blancs':'Noirs'}</Text><Text style={layout.body}>{session.exercise.objective}</Text>
    <Chessboard fen={session.mode==='guided' ? state.position?.fen??session.fen : session.fen} color={session.color} legalMoves={session.legalMoves} lastMove={session.lastMove} checkSquare={state.position?.checkSquare} disabled={done||state.busy||(session.mode==='guided'&&state.selectedPly!==session.ply)} onMove={events.onExerciseMove}/>
    {session.mode==='guided'&&<><View style={layout.row}><Button label="Précédent" secondary disabled={state.selectedPly===0} onPress={()=>events.onPly(state.selectedPly-1)}/><Text style={layout.body}>{state.selectedPly} / {session.exercise.moves.length}</Text><Button label="Suivant" secondary disabled={state.selectedPly===session.exercise.moves.length} onPress={()=>events.onPly(state.selectedPly+1)}/></View>{session.exercise.notes?.[Math.max(0,state.selectedPly-1)]&&<Text style={layout.body}>{session.exercise.notes[Math.max(0,state.selectedPly-1)]}</Text>}</>}
    {session.expectedMove&&<Text style={layout.body}>Coup du guide : {session.expectedMove}</Text>}
    {state.message&&<Text accessibilityLiveRegion="polite" style={layout.body}>{state.message}</Text>}
    {session.hint&&<Panel><Text style={layout.body}>{session.hint}</Text></Panel>}
    {!done&&<View style={layout.stack}><Button label="Un indice" secondary onPress={events.onHint} disabled={state.busy}/><Button label="Voir la solution expliquée" secondary onPress={events.onReveal} disabled={state.busy}/></View>}
    {(done||session.mode==='guided')&&<Panel><Text style={layout.section}>Comprendre la position</Text><Text style={layout.body}>{session.exercise.explanation}</Text>{done&&<Text style={layout.body}>Suite : {session.exercise.moves.join(' · ')}</Text>}</Panel>}
    {done&&<Button label="Rejouer de mémoire" onPress={()=>events.onExercise(session.exercise.id,session.color)}/>}
  </View>;
}
function PlayScreen({state,events}:ScreenProps){
  const [color,setColor]=useState<GameOptions['color']>(state.gameOptions.color);const [level,setLevel]=useState<GameOptions['level']>(state.gameOptions.level);
  return <View style={layout.stack}><Text style={layout.title}>Jouer contre Stockfish</Text><Text style={layout.body}>Une partie à votre rythme, entièrement sur le téléphone.</Text>{state.activeGame&&<Button label="Reprendre ma partie" onPress={events.onResume}/>}<Text style={layout.section}>Votre camp</Text><View style={layout.row}>{([['w','Blancs'],['b','Noirs'],['random','Au hasard']] as const).map(([value,label])=><Choice key={value} label={label} selected={color===value} onPress={()=>setColor(value)}/>)}</View><Text style={layout.section}>Difficulté</Text><View style={layout.row}>{(Object.keys(levels) as GameOptions['level'][]).map((value)=><Choice key={value} label={levels[value]} selected={level===value} onPress={()=>setLevel(value)}/>)}</View><Text style={layout.muted}>Découverte aide à prendre vos marques ; Club demande plus de précision. Ces niveaux décrivent le réglage du moteur, sans classement officiel.</Text><Button label="Commencer une partie" onPress={()=>events.onStartGame({color,level})} disabled={state.busy}/><Button label="Historique et analyse" secondary onPress={events.onHistory}/><Text style={layout.muted}>Nulle automatique après trois répétitions, 50 coups sans prise ni mouvement de pion, pat ou matériel insuffisant.</Text></View>;
}
function GameScreen({state,events}:ScreenProps){
  const session=state.game;if(!session)return <Text style={layout.body}>La partie est sauvegardée. Retrouvez-la dans Jouer.</Text>;const ended=Boolean(session.record.finishedAt);
  return <View style={layout.stack}><Text style={layout.title}>{ended?'Partie terminée':'Votre partie'}</Text><Text style={layout.muted}>Stockfish · {levels[session.record.level]} · vous jouez les {session.record.color==='w'?'blancs':'noirs'}</Text><Chessboard fen={session.position.fen} color={session.record.color} legalMoves={session.position.legalMoves} lastMove={session.record.moves.at(-1)} checkSquare={session.position.checkSquare} disabled={state.busy||state.thinking||ended||session.position.turn!==session.record.color} onMove={events.onGameMove}/>{state.thinking&&<ActivityIndicator color={colors.primary}/>}<Text accessibilityLiveRegion="polite" style={layout.body}>{state.message}</Text><Text style={layout.muted}>{session.position.history.map((move,index)=>`${index%2===0?`${Math.floor(index/2)+1}. `:''}${move}`).join(' ')||'Les blancs commencent.'}</Text>{ended?<Button label="Analyser cette partie" onPress={()=>events.onAnalysis(session.record.id)}/>:<><Button label="Revenir à l’accueil · partie sauvegardée" secondary onPress={()=>events.onNavigate('home')}/><Button label="Abandonner la partie" secondary onPress={events.onResign} disabled={state.busy}/></>}</View>;
}
function HistoryScreen({state,events}:ScreenProps){return <View style={layout.stack}><Text style={layout.title}>Vos parties</Text>{state.history.length===0&&<Text style={layout.body}>Vos parties terminées apparaîtront ici. Jouez une partie contre Stockfish pour commencer.</Text>}{state.history.map((session)=><ActionRow key={session.record.id} title={`${session.record.result??'Partie'} · ${levels[session.record.level]}`} detail={`${new Date(session.record.startedAt).toLocaleDateString('fr-FR')} · ${session.record.moves.length} demi-coups · toucher pour parcourir et analyser`} onPress={()=>events.onAnalysis(session.record.id)}/>)}</View>;}
function AnalysisScreen({state,events}:ScreenProps){
  const session=state.game;const details=state.analysisDetails;if(!session||!state.position||!details)return null;
  return <View style={layout.stack}><Text style={layout.title}>Analyse de la partie</Text><Text style={layout.muted}>{session.record.result} · {levels[session.record.level]} · {new Date(session.record.startedAt).toLocaleDateString('fr-FR')}</Text><Chessboard fen={state.position.fen} color={session.record.color} lastMove={session.record.moves[state.selectedPly-1]} checkSquare={state.position.checkSquare}/><View style={layout.row}><Button label="Précédent" secondary disabled={state.selectedPly===0} onPress={()=>events.onPly(state.selectedPly-1)}/><Text style={layout.body}>{state.selectedPly} / {session.record.moves.length}</Text><Button label="Suivant" secondary disabled={state.selectedPly===session.record.moves.length} onPress={()=>events.onPly(state.selectedPly+1)}/></View>
    <Panel><Text style={layout.body}>{details.evaluationMessage}</Text>{details.bestMoveMessage&&<Text style={layout.body}>{details.bestMoveMessage}</Text>}{details.continuationMessage&&<Text style={layout.muted}>{details.continuationMessage}</Text>}{details.assessmentMessage&&<Text style={layout.body}>{details.assessmentMessage}</Text>}</Panel>
    <Text accessibilityLiveRegion="polite" style={layout.body}>{details.statusMessage}</Text>{state.analyzing?<Button label="Annuler l’analyse" secondary onPress={events.onCancelAnalysis}/>:<Button label={details.actionLabel} onPress={events.onAnalyze} disabled={state.busy||state.analysis?.record.complete}/>}
    <Text style={layout.muted}>Écarts : imprécision à partir de 0,5 pion, erreur à partir de 1 pion, grosse erreur à partir de 2 pions. Les annonces de mat sont traitées séparément. Une analyse rapide guide l’apprentissage ; ses évaluations peuvent varier avec le calcul.</Text>
    <Text style={layout.section}>Les coups joués</Text>{state.position.history.map((move,index)=><Text style={layout.body} key={index}>{Math.floor(index/2)+1}{index%2===0?'.':'…'} {move}</Text>)}
  </View>;
}
function ProgressScreen({state,events}:ScreenProps){
  const summary=state.summary;if(!summary)return null;
  return <View style={layout.stack}><Text style={layout.title}>Votre progression</Text><Text style={layout.body}>{summary.streak} jour{summary.streak===1?'':'s'} de suite · {summary.activeDays.length} jour{summary.activeDays.length===1?'':'s'} actif{summary.activeDays.length===1?'':'s'}</Text><Text style={layout.section}>Résultats d’apprentissage</Text>{(['opening','puzzle','endgame'] as const).map((kind)=><View style={styles.statRow} key={kind}><Text style={layout.body}>{kindLabels[kind]}</Text><Text style={layout.muted}>{summary.byKind[kind].success} sans aide · {summary.byKind[kind].assisted} avec aide · {summary.byKind[kind].failed} à revoir</Text></View>)}<Text style={layout.body}>{summary.toReview} exercice{summary.toReview===1?'':'s'} à retravailler · {summary.finishedGames} partie{summary.finishedGames===1?'':'s'} terminée{summary.finishedGames===1?'':'s'}</Text><Text style={layout.section}>Mémoire des ouvertures</Text><Text style={layout.body}>{summary.mastered} variante{summary.mastered===1?'':'s'} consolidée{summary.mastered===1?'':'s'} · {summary.learning} en apprentissage</Text><Text style={layout.muted}>Consolidée : trois révisions consécutives sans aide. Échéances après réussite : 1, 3, 7, 14 puis 30 jours. Une erreur remet la variante au premier palier.</Text>{summary.due.length?<><Text style={layout.section}>Révisions dues</Text>{summary.due.map((review)=><ActionRow key={`${review.contentId}:${review.color??'w'}`}  title={state.titles[review.contentId]??'Variante à réviser'} detail={`${review.color==='b'?'Noirs':'Blancs'} · Palier ${review.stage} · échéance ${new Date(review.due).toLocaleDateString('fr-FR')}`} onPress={()=>events.onExercise(review.contentId,review.color)}/>)}</>:<Text style={layout.body}>Aucune révision due. Entraînez une variante de mémoire pour lancer son calendrier.</Text>}<Text style={layout.section}>Activité quotidienne</Text>{summary.activeDays.length===0?<Text style={layout.body}>Terminez un exercice ou une partie pour enregistrer votre première journée.</Text>:summary.activeDays.slice(-14).reverse().map((day)=><View key={day} style={styles.statRow}><Text style={layout.body}>{day.split('-').reverse().join('/')}</Text><Text style={[layout.muted,{color:colors.success}]}>Journée active</Text></View>)}<Button label="Consulter l’historique des parties" secondary onPress={events.onHistory}/><Text style={layout.muted}>Cette progression appartient à cette installation. Gardez Chess69 installé lors des mises à jour.</Text></View>;
}
function ActionRow({title,detail,onPress}:Readonly<{title:string;detail:string;onPress:()=>void}>){return <Pressable accessibilityRole="button" onPress={onPress} android_ripple={{color:'#FFFFFF20'}} style={styles.action}><Text style={styles.actionTitle}>{title}</Text><Text style={layout.muted}>{detail}</Text></Pressable>;}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.surface},topbar:{minHeight:64,paddingHorizontal:12,paddingVertical:8,flexDirection:'row',alignItems:'center',gap:8},backButton:{width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center',overflow:'hidden'},smallLogo:{width:32,height:32},logo:{width:40,height:40},brand:{color:colors.onSurface,fontSize:20,fontWeight:'700',flex:1},scroll:{paddingHorizontal:12,paddingTop:12,paddingBottom:24},content:{width:'100%',maxWidth:480,alignSelf:'center',gap:12},loading:{paddingVertical:48,gap:20,alignItems:'center'},error:{backgroundColor:'#442B2B',padding:16,borderRadius:12,gap:12},navigation:{flexDirection:'row',paddingHorizontal:4,paddingVertical:8,minHeight:80,backgroundColor:colors.surfaceContainer},navItem:{flex:1,minHeight:64,alignItems:'center',justifyContent:'center',gap:4,paddingVertical:4},navIndicator:{width:64,height:32,borderRadius:16,overflow:'hidden',backgroundColor:colors.surfaceContainer,alignItems:'center',justifyContent:'center'},navSelected:{backgroundColor:'#54371F'},navLabel:{color:colors.muted,fontSize:12,lineHeight:16,fontWeight:'600',textAlign:'center'},navLabelSelected:{color:colors.primary},focus:{backgroundColor:colors.primary,padding:20,borderRadius:16,gap:12,marginTop:8},focusTitle:{fontSize:24,lineHeight:32,fontWeight:'700',color:colors.onPrimary},action:{minHeight:64,paddingVertical:16,borderBottomWidth:1,borderColor:colors.outline,gap:4},actionTitle:{color:colors.onSurface,fontSize:18,lineHeight:26,fontWeight:'600'},statRow:{paddingVertical:12,borderBottomWidth:1,borderColor:colors.outline,gap:4},
});
