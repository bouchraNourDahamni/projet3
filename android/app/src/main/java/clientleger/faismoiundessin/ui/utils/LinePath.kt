package clientleger.faismoiundessin.ui.utils

import android.graphics.Path
import clientleger.faismoiundessin.ui.fragments.DrawFragment
import kotlin.math.abs

class LinePath : Path() {
    private var idPointer: Int? = null
    var lastX = 0f
        private set
    var lastY = 0f
        private set

    fun touchStart(x: Float, y: Float) {
        reset()
        moveTo(x, y)
        lastX = x
        lastY = y
    }

    fun touchMove(x: Float, y: Float) {
        val dx = abs(x - lastX)
        val dy = abs(y - lastY)
        if (dx >= DrawFragment.TOUCH_TOLERANCE || dy >= DrawFragment.TOUCH_TOLERANCE) {
            quadTo(lastX, lastY, (x + lastX) / 2, (y + lastY) / 2)
            lastX = x
            lastY = y
        }
    }

    val isDisassociatedFromPointer: Boolean
        get() = idPointer == null

    fun isAssociatedToPointer(idPointer: Int): Boolean {
        return (this.idPointer != null
                && this.idPointer == idPointer)
    }

    fun disassociateFromPointer() {
        idPointer = null
    }

    fun associateToPointer(idPointer: Int) {
        this.idPointer = idPointer
    }

}
