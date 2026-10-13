import { ChessPiece } from './chess-piece';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button } from './controls';
import { colors, layout } from './theme';

type ChessboardProps = Readonly<{ fen: string; color: 'w' | 'b'; legalMoves?: readonly string[]; lastMove?: string | null; checkSquare?: string | null; disabled?: boolean; onMove?: (move: string) => void }>;
const names: Record<string,string> = {p:'pion',n:'cavalier',b:'fou',r:'tour',q:'dame',k:'roi'};

export function Chessboard({fen,color,legalMoves=[],lastMove=null,checkSquare=null,disabled=false,onMove}: ChessboardProps) {
  const [selection,setSelection] = useState<Readonly<{fen:string;square:string}> | null>(null);
  const [promotion,setPromotion] = useState<readonly string[]>([]);
  const {width} = useWindowDimensions();
  const selected = selection?.fen === fen ? selection.square : null;
  const files = color==='w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = color==='w' ? '87654321' : '12345678';
  const pieces = boardPieces(fen);
  const targets = legalMoves.filter((move)=>move.startsWith(selected ?? '-')).map((move)=>move.slice(2,4));
  const moveTo = (square: string) => {
    if(disabled||!onMove)return;
    const moves = selected ? legalMoves.filter((move)=>move.slice(0,4)===selected+square) : [];
    if(moves.length>1){setPromotion(moves);return;}
    if(moves[0]){setSelection(null);onMove(moves[0]);return;}
    setSelection(legalMoves.some((move)=>move.startsWith(square)) ? {fen,square} : null);
  };
  return <View style={styles.wrapper}>
    <Text style={[layout.muted,styles.turn]}>{fen.split(' ')[1]==='w' ? 'Trait aux blancs' : 'Trait aux noirs'}{checkSquare ? ' · Roi en échec' : ''}</Text>
    <View style={styles.board} accessibilityLabel="Échiquier. Touchez une pièce, puis une case de destination.">
      {[...ranks].map((rank,row)=><View style={styles.rank} key={rank}>{[...files].map((file,column)=>{
        const square=file+rank;const piece=pieces[square];const isLast=lastMove?.slice(0,2)===square||lastMove?.slice(2,4)===square;
        const dark=(Number(rank)+file.charCodeAt(0)-97)%2===1;
        return <Pressable key={square} accessibilityRole="button" accessibilityLabel={`${square}${piece ? `, ${piece===piece.toUpperCase()?'blanc':'noir'} ${names[piece.toLowerCase()]}` : ', vide'}${targets.includes(square)?', coup possible':''}${checkSquare===square?', roi en échec':''}`} accessibilityState={{selected:selected===square,disabled:disabled||!onMove}} onPress={()=>moveTo(square)} style={[styles.square,{backgroundColor:dark?colors.boardDark:colors.boardLight},isLast&&styles.last,selected===square&&styles.selected,checkSquare===square&&styles.check]}>
          {column===0&&<Text style={[styles.coordinate,{color:dark?'#FFF3E0':'#4F3824'}]}>{rank}</Text>}
          {row===7&&<Text style={[styles.file,{color:dark?'#FFF3E0':'#4F3824'}]}>{file}</Text>}
          {piece&&<ChessPiece piece={piece} size={Math.min((width-24)/8,60)*0.9}/>}
          {targets.includes(square)&&<View style={piece?styles.capture:styles.dot}/>}
        </Pressable>;
      })}</View>)}
    </View>
    <Modal visible={promotion.length>0} transparent animationType="fade" onRequestClose={()=>setPromotion([])}><View style={styles.scrim}><View style={styles.dialog}><Text style={layout.section}>Promouvoir le pion</Text>{[['q','Dame'],['r','Tour'],['b','Fou'],['n','Cavalier']].map(([suffix,label])=><Button key={suffix} label={label!} onPress={()=>{const move=promotion.find((candidate)=>candidate.endsWith(suffix!));setPromotion([]);setSelection(null);if(move)onMove?.(move);}}/>)}<Button label="Annuler" secondary onPress={()=>setPromotion([])}/></View></View></Modal>
  </View>;
}
function boardPieces(fen:string):Record<string,string>{
  const pieces:Record<string,string>={};
  fen.split(' ')[0]!.split('/').forEach((row,index)=>{let file=0;for(const value of row){if(/\d/.test(value)){file+=Number(value);continue;}pieces['abcdefgh'[file]!+String(8-index)]=value;file+=1;}});
  return pieces;
}
const styles=StyleSheet.create({
  wrapper:{gap:8},turn:{alignSelf:'flex-start'},board:{width:'100%',maxWidth:480,alignSelf:'center',borderRadius:4,overflow:'hidden'},rank:{flexDirection:'row'},square:{width:'12.5%',aspectRatio:1,alignItems:'center',justifyContent:'center'},
  coordinate:{position:'absolute',top:1,left:3,fontSize:10,fontWeight:'700'},file:{position:'absolute',bottom:1,right:3,fontSize:10,fontWeight:'700'},
  selected:{backgroundColor:colors.boardSelected},last:{backgroundColor:'#B8A05E'},check:{backgroundColor:'#BF6057'},dot:{width:12,height:12,borderRadius:6,backgroundColor:'#29231988',position:'absolute'},capture:{position:'absolute',width:'92%',height:'92%',borderRadius:50,borderWidth:3,borderColor:'#ED8127'},
  scrim:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#000000BB'},dialog:{backgroundColor:colors.surfaceContainer,padding:24,borderRadius:24,gap:8},
});
