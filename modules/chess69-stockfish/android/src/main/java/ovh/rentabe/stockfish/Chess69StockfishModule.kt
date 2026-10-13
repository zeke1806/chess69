package ovh.rentabe.stockfish

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executors

/** One worker owns initialization, search and disposal. stop is thread safe in Stockfish. */
class Chess69StockfishModule : Module() {
  private val worker = Executors.newSingleThreadExecutor()
  private val lifecycleLock = Any()
  private var handle: Long = 0
  private external fun nativeInitialize(): Long
  private external fun nativeUci(handle: Long): String
  private external fun nativeEvaluate(handle: Long, fen: String, skill: Int, movetime: Int): String
  private external fun nativeCancel(handle: Long)
  private external fun nativeDispose(handle: Long)

  private fun cancel() = synchronized(lifecycleLock) { if (handle != 0L) nativeCancel(handle) }
  private fun execute(promise: Promise, action: () -> Any?) {
    worker.execute {
      try { promise.resolve(action()) }
      catch (error: Throwable) { promise.reject("STOCKFISH_ERROR", error.message, error) }
    }
  }
  override fun definition() = ModuleDefinition {
    Name("Chess69Stockfish")
    AsyncFunction("initialize") { promise: Promise ->
      execute(promise) {
        synchronized(lifecycleLock) {
          if (handle == 0L) {
            System.loadLibrary("chess69_stockfish")
            handle = nativeInitialize()
          }
          nativeUci(handle)
        }
      }
    }
    AsyncFunction("evaluate") { fen: String, skill: Int, movetime: Int, promise: Promise ->
      execute(promise) {
        val current = synchronized(lifecycleLock) { handle }
        check(current != 0L) { "Stockfish doit être initialisé." }
        nativeEvaluate(current, fen, skill.coerceIn(0, 20), movetime.coerceIn(50, 5000))
      }
    }
    AsyncFunction("cancel") { cancel() }
    AsyncFunction("dispose") { promise: Promise ->
      cancel()
      execute(promise) {
        synchronized(lifecycleLock) {
          nativeDispose(handle)
          handle = 0
        }
      }
    }
    OnDestroy {
      cancel()
      worker.execute { synchronized(lifecycleLock) { nativeDispose(handle); handle = 0 } }
      worker.shutdown()
    }
  }
}
