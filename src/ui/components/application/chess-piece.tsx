import { SvgXml } from 'react-native-svg';
import pieceData from './pieces/pieces.json';
const pieces: Readonly<Record<string,string>> = pieceData;

export function ChessPiece({piece,size}:Readonly<{piece:string;size:number}>){
  const key=(piece===piece.toUpperCase()?'w':'b')+piece.toUpperCase();
  const xml=pieces[key];
  if(!xml)return null;
  return <SvgXml xml={xml} width={size} height={size} accessible={false}/>;
}
