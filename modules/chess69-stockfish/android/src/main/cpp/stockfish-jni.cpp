// Chess69 Stockfish JNI bridge — GPL-3.0-or-later, like the linked engine.
#include <jni.h>
#include <memory>
#include <mutex>
#include <sstream>
#include <string>
#include "bitboard.h"
#include "engine.h"
#include "misc.h"
#include "position.h"
#include "uci.h"

using namespace Stockfish;
namespace {
std::once_flag initialized;
struct Session {
  Engine engine;
  std::string latestInfo;
  std::string bestmove;

  Session();
};

Session* session(jlong handle);
void throwError(JNIEnv* env, const char* message);
}

extern "C" JNIEXPORT jlong JNICALL Java_ovh_rentabe_stockfish_Chess69StockfishModule_nativeInitialize(JNIEnv* env, jobject) {
  try {
    std::call_once(initialized, [] {
      Bitboards::init();
      Position::init();
    });
    return reinterpret_cast<jlong>(new Session());
  } catch (const std::exception& error) {
    throwError(env, error.what());
    return 0;
  }
}

extern "C" JNIEXPORT jstring JNICALL Java_ovh_rentabe_stockfish_Chess69StockfishModule_nativeUci(JNIEnv* env, jobject, jlong handle) {
  std::ostringstream output;
  output << "id name " << engine_info(true) << "\n" << session(handle)->engine.get_options() << "\nuciok\nreadyok";
  return env->NewStringUTF(output.str().c_str());
}

extern "C" JNIEXPORT jstring JNICALL Java_ovh_rentabe_stockfish_Chess69StockfishModule_nativeEvaluate(JNIEnv* env, jobject, jlong handle, jstring fen, jint skill, jint movetime) {
  auto current = session(handle);
  const char* chars = env->GetStringUTFChars(fen, nullptr);
  std::string position(chars);
  env->ReleaseStringUTFChars(fen, chars);

  try {
    current->latestInfo.clear();
    current->bestmove.clear();
    std::istringstream option("name Skill Level value " + std::to_string(skill));
    current->engine.get_options().setoption(option);
    current->engine.set_position(position, {});

    Search::LimitsType limits;
    limits.startTime = now();
    limits.movetime = movetime;
    current->engine.go(limits);
    current->engine.wait_for_search_finished();
    std::string result = current->latestInfo + "\nbestmove " + current->bestmove;
    return env->NewStringUTF(result.c_str());
  } catch (const std::exception& error) {
    throwError(env, error.what());
    return nullptr;
  }
}

extern "C" JNIEXPORT void JNICALL Java_ovh_rentabe_stockfish_Chess69StockfishModule_nativeCancel(JNIEnv*, jobject, jlong handle) {
  if (handle) {
    session(handle)->engine.stop();
  }
}

extern "C" JNIEXPORT void JNICALL Java_ovh_rentabe_stockfish_Chess69StockfishModule_nativeDispose(JNIEnv*, jobject, jlong handle) {
  if (handle) {
    delete session(handle);
  }
}

namespace {
Session::Session() {
  engine.set_tt_size(16);
  engine.set_on_update_no_moves([this](const Engine::InfoShort& info) {
    latestInfo = "info depth " + std::to_string(info.depth) + " score " + UCIEngine::format_score(info.score);
  });

  engine.set_on_update_full([this](const Engine::InfoFull& info) {
    if (info.multiPV != 1 || !info.bound.empty()) {
      return;
    }
    latestInfo = "info depth " + std::to_string(info.depth) + " score " + UCIEngine::format_score(info.score) + " pv " + std::string(info.pv);
  });

  engine.set_on_bestmove([this](std::string_view move, std::string_view) {
    bestmove = std::string(move);
  });
}

Session* session(jlong handle) {
  return reinterpret_cast<Session*>(handle);
}

void throwError(JNIEnv* env, const char* message) {
  env->ThrowNew(env->FindClass("java/lang/IllegalStateException"), message);
}
}
