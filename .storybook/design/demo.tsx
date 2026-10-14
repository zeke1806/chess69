import { useState } from 'react';
import { DesignScreen } from './design-screen';
import type { DesignFilter, DesignPage } from './design-screen';

/** Local Storybook interactions only; does not import application services. */
export function DesignDemo({ initialPage = 'home' }: Readonly<{ initialPage?: DesignPage }>) {
  const [page, setPage] = useState<DesignPage>(initialPage);
  const [selectedCard, setSelectedCard] = useState('italian');
  const [filter, setFilter] = useState<DesignFilter>('opening');
  const [selectedSquare, setSelectedSquare] = useState<string>();
  const [selectedMove, setSelectedMove] = useState(2);
  const [hintVisible, setHintVisible] = useState(false);

  return (
    <DesignScreen
      page={page}
      selectedCard={selectedCard}
      filter={filter}
      selectedSquare={selectedSquare}
      selectedMove={selectedMove}
      hintVisible={hintVisible}
      onNavigate={setPage}
      onSelectCard={setSelectedCard}
      onFilter={setFilter}
      onSelectSquare={setSelectedSquare}
      onSelectMove={setSelectedMove}
      onToggleHint={() => setHintVisible((visible) => !visible)}
    />
  );
}
