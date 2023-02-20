package clientleger.faismoiundessin.ui.utils

import clientleger.faismoiundessin.repository.data.DrawingInfo
import java.util.*

object UndoRedoUtils {
    var actions: Stack<DrawingInfo> = Stack()
    var actionsToRedo: Stack<DrawingInfo> = Stack()

    fun undo(): Boolean {
        if (this.actions.isEmpty()) return false

        val actionUndone: DrawingInfo = this.actions.pop()
        this.actionsToRedo.push(actionUndone)

        return true
    }

    fun redo(): Boolean {
        if (this.actionsToRedo.isEmpty()) return false

        val actionToRedo: DrawingInfo = this.actionsToRedo.pop()
        this.actions.push(actionToRedo)

        return true
    }

    fun registerAction(action: DrawingInfo) {
        this.actionsToRedo.clear()
        this.actions.push(action)
    }

}
