# Manrope embarquée

Source : Manrope variable déjà approuvée dans la proposition Design, issue du
projet Google Fonts Manrope. Licence SIL OFL : `manrope-license.txt`.

L’application charge trois instances statiques locales : `manrope-400.ttf`,
`manrope-600.ttf`, `manrope-700.ttf`. Elles correspondent à Chess69Regular,
Chess69Semibold et Chess69Bold, sans demande synthétique de poids à Android.
Storybook enregistre exactement les mêmes fichiers et familles ; la famille
variable Chess69Display reste réservée à la proposition de design originale.

Les instances sont dérivées de `manrope.ttf` avec fontTools 4.60.1, dans un
venv de conversion temporaire, sans dépendance Python de l’application :

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

for weight in (400, 600, 700):
    font = instantiateVariableFont(TTFont('src/assets/manrope.ttf'), {'wght': weight}, inplace=True)
    font.save(f'src/assets/manrope-{weight}.ttf')
```

Contrôle : les fichiers statiques ne possèdent plus d’axe `fvar` et leurs
`OS/2.usWeightClass` valent respectivement 400, 600 et 700. Cette adaptation
évite le rendu natif fin observé lorsque la police variable est chargée sous
une seule famille sur Android.
