import Svg, { Path } from 'react-native-svg';
import type { Destination } from '../../../services-front/application/application-type';

const paths: Readonly<Record<Destination | 'back', string>> = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  learn: 'M12 6C9 4 5 4 2 5v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-3-1-7-1-10 1v15',
  play: 'M4 4h16v16H4V4Zm0 8h16M12 4v16M4 4h8v8H4M12 12h8v8h-8',
  progress: 'M4 20V12h4v8M10 20V8h4v12M16 20V4h4v16M2 20h20',
  back: 'M20 12H4m7-7-7 7 7 7',
};
/** Original geometric symbols, packaged in the application; no icon font or download. */
export function NavigationIcon({kind,color}:Readonly<{kind:Destination|'back';color:string}>){
  return <Svg width={24} height={24} viewBox="0 0 24 24" accessible={false}><Path d={paths[kind]} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
}
