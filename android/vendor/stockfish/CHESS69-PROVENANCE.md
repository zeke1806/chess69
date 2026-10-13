Sources upstream : archive officielle `Stockfish/archive/refs/tags/sf_17.1.tar.gz`,
tag `sf_17.1` (commit `03e2748`). Le moteur et ses sources sont inchangés.
Sources, Makefile, documentation, licence et réseaux exacts sont conservés.

Compilation Android : `modules/chess69-stockfish/android/CMakeLists.txt`,
NDK 27.1.12297006, C++17, ARM64 NEON, 16 Kio ; JNI GPL-3.0-or-later.
Les NNUE sont incorporés par `incbin` dans l'ELF ; l'application n'a aucun
fichier ni réseau à télécharger au démarrage.
