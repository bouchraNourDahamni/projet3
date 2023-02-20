package clientleger.faismoiundessin.ui.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.os.Handler
import android.os.Looper
import android.util.AttributeSet
import android.util.Log
import android.view.MotionEvent
import android.view.View
import clientleger.faismoiundessin.R
import clientleger.faismoiundessin.repository.data.DrawingInfo
import clientleger.faismoiundessin.repository.data.PointInfo
import clientleger.faismoiundessin.repository.service.GameSocketListener
import clientleger.faismoiundessin.ui.fragments.DrawFragment
import clientleger.faismoiundessin.ui.fragments.DrawFragment.Companion.MAX_POINTERS
import clientleger.faismoiundessin.ui.utils.LinePath
import clientleger.faismoiundessin.ui.utils.UndoRedoUtils.actions
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class CanevasView(c: Context?, attrs: AttributeSet? = null) : View(c, attrs) {
    private var mBitmap: Bitmap
    private var mBitmapBackground: Bitmap
    private var mBitmapGrid: Bitmap
    private val mCanvas: Canvas
    private val mBitmapPaint: Paint
    private val multiLinePathManager: MultiLinePathManager
    private var serverPathManager: MultiLinePathManager

    var mPaint: Paint? = null
    private var mGridPath: Path = Path()
    private var mGridPaint: Paint = Paint()
    var tmpColor = Color.BLACK
    var tmpWidth = DrawFragment.DEFAULT_BRUSH_SIZE.toFloat()
    var isErasing: Boolean = false

    private var mBlur: MaskFilter? = null

    lateinit var drawing: DrawingInfo
    private lateinit var undoRedoDrawing: DrawingInfo
    private lateinit var drawing2: DrawingInfo
    private lateinit var pathData: ArrayList<PointInfo>
    private lateinit var pathData2: ArrayList<PointInfo>

    var gridZoom: Int? = null

    lateinit var gameSocketListener: GameSocketListener
    var canDrawCanvas: Boolean = false

    fun paintInit(gameSocketListener_: GameSocketListener, canDraw: Boolean) {
        mPaint = Paint()
        mPaint!!.isAntiAlias = true
        mPaint!!.isDither = true
        mPaint!!.color = Color.BLACK
        mPaint!!.style = Paint.Style.STROKE
        mPaint!!.strokeJoin = Paint.Join.ROUND
        mPaint!!.strokeCap = Paint.Cap.ROUND
        mPaint!!.strokeWidth = DrawFragment.DEFAULT_BRUSH_SIZE.toFloat()

        mGridPaint.isAntiAlias = true
        mGridPaint.isDither = true
        mGridPaint.color = Color.BLACK
        mGridPaint.style = Paint.Style.STROKE
        mGridPaint.strokeJoin = Paint.Join.ROUND
        mGridPaint.strokeCap = Paint.Cap.ROUND
        mGridPaint.xfermode = null
        mGridPaint.alpha = 0xff

        mBlur = BlurMaskFilter(5F, BlurMaskFilter.Blur.NORMAL)

        gridZoom = 50

        pathData = ArrayList()
        pathData2 = ArrayList()

        drawing = DrawingInfo(
            ArrayList(),
            "#" + Integer.toHexString(mPaint!!.color).substring(2),
            mPaint!!.strokeWidth.toInt(),
            1.0f,
            "stroke"
        )
        drawing2 = DrawingInfo(
            ArrayList(),
            "#" + Integer.toHexString(mPaint!!.color).substring(2),
            mPaint!!.strokeWidth.toInt(),
            1.0f,
            "stroke"
        )
        undoRedoDrawing = DrawingInfo(
            ArrayList(),
            "#" + Integer.toHexString(mPaint!!.color).substring(2),
            mPaint!!.strokeWidth.toInt(),
            1.0f,
            "save"
        )

        gameSocketListener = gameSocketListener_
        canDrawCanvas = canDraw
    }

    @SuppressLint("DrawAllocation")
    override fun onDraw(canvas: Canvas) {
        canvas.drawColor(-0x1) // https://developer.android.com/training/custom-views/custom-drawing
        canvas.drawBitmap(
            mBitmapBackground,
            0f,
            0f,
            Paint()
        ) // https://developer.android.com/reference/android/graphics/Canvas#drawBitmap(android.graphics.Bitmap,%20float,%20float,%20android.graphics.Paint)
        canvas.drawBitmap(mBitmap, 0f, 0f, mBitmapPaint)
        for (i in serverPathManager.superMultiPaths.indices) {
            serverPathManager.superMultiPaths[i]?.let {
                mPaint?.let { it1 ->
                    canvas.drawPath(
                        it,
                        it1
                    )
                }
            }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (canDrawCanvas) {
            var linePath: LinePath?
            var index: Int
            var id: Int
            if (!isErasing)
                mPaint!!.color = tmpColor
            mPaint!!.strokeWidth = tmpWidth

            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {

                    index = event.actionIndex
                    id = event.getPointerId(index)
                    val path = PointInfo(event.getX(index).toInt(), event.getY(index).toInt())
                    drawing.pathdata.add(path)
                    drawing2.pathdata.add(path)
                    undoRedoDrawing.pathdata.add(path)

                    linePath = multiLinePathManager.addLinePathWithPointer(id)
                    linePath?.touchStart(event.getX(index), event.getY(index))
                        ?: Log.e("anupam", "Too many fingers!")
                }
                MotionEvent.ACTION_MOVE -> {
                    var i = 0
                    while (i < event.pointerCount) {
                        id = event.getPointerId(i)
                        index = event.findPointerIndex(id)

                        linePath = multiLinePathManager.findLinePathFromPointer(id)
                        linePath?.touchMove(event.getX(index), event.getY(index))

                        val path2 = PointInfo(linePath!!.lastX.toInt(), linePath.lastY.toInt())
                        pathData.add(path2)
                        pathData2.add(path2)
                        drawing2.pathdata.add(path2)
                        undoRedoDrawing.pathdata.add(path2)

                        Handler(Looper.getMainLooper()).postDelayed({
                            if (pathData2.size >= 2) {
                                drawing = DrawingInfo(
                                    pathData2,
                                    "#" + Integer.toHexString(mPaint!!.color)
                                        .substring(2),
                                    mPaint!!.strokeWidth.toInt(),
                                    1.0f,
                                    "stroke"
                                )
                                gameSocketListener.ws.send(
                                    Json.encodeToString(
                                        drawing
                                    )
                                )
                                pathData2.clear()


                                if (pathData.size > 1) pathData2.add(
                                    pathData[pathData.size - 2]
                                )

                                if (pathData.size > 0) pathData2.add(
                                    pathData[pathData.size - 1]
                                )
                            }

                        }, 50)
                        i++
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                    undoRedoDrawing.color = "#" + Integer.toHexString(mPaint!!.color).substring(2)
                    undoRedoDrawing.size = mPaint!!.strokeWidth.toInt()
                    gameSocketListener.ws.send(Json.encodeToString(undoRedoDrawing))

                    pathData2.clear()
                    drawing.pathdata.clear()
                    pathData.clear()
                    undoRedoDrawing.pathdata.clear()
                }
            }
        }
        return true
    }

    fun showGrid(showGrid: Boolean) {
        if (!showGrid) {
            invalidate()
        } else {
            val gridPath = Path()
            for (i in 0..mBitmapGrid.width step 60) {
                gridPath.moveTo(i.toFloat(), 0F)
                gridPath.lineTo(i.toFloat(), mBitmapGrid.height.toFloat())
            }

            for (i in 0..mBitmapGrid.height step 60) {
                gridPath.moveTo(0F, i.toFloat())
                gridPath.lineTo(mBitmapGrid.width.toFloat(), i.toFloat())
            }

            mGridPath = gridPath
            mCanvas.drawPath(mGridPath, mGridPaint)
        }
        invalidate()
    }

    fun reconstituteCanvas() {
        clearDrawing()
        for (i in 0 until actions.size) {
            drawLine(actions[i])
        }
    }

    fun clearDrawing() {
        mBitmap.eraseColor(Color.TRANSPARENT)
        mBitmapBackground.eraseColor(Color.TRANSPARENT)
    }

    fun drawLine(drawingInfo: DrawingInfo) {
        val numOfPoints = drawingInfo.pathdata.size
        mPaint!!.color = Color.parseColor(drawingInfo.color)
        mPaint!!.strokeWidth = drawingInfo.size.toFloat()

        val linePath: LinePath? = serverPathManager.addLinePathWithPointer(0)
        linePath?.touchStart(
            drawingInfo.pathdata[0].x.toFloat(),
            drawingInfo.pathdata[0].y.toFloat()
        )

        var i = 1
        while (i < numOfPoints) {
            linePath?.touchMove(
                drawingInfo.pathdata[i].x.toFloat(),
                drawingInfo.pathdata[i].y.toFloat()
            )

            i++
        }

        if (linePath != null) {
            linePath.lineTo(linePath.lastX, linePath.lastY)

            linePath.setLastPoint(linePath.lastX, linePath.lastY)
            // Commit the path to our offscreen
            mPaint?.let { mCanvas.drawPath(linePath, it) }
            linePath.reset()

            // Allow this LinePath to be associated to another idPointer
            linePath.disassociateFromPointer()
        }
        invalidate()
    }

    inner class MultiLinePathManager(maxPointers: Int) {
        var superMultiPaths: Array<LinePath?> = arrayOfNulls(maxPointers)
        fun findLinePathFromPointer(idPointer: Int): LinePath? {
            for (superMultiPath in superMultiPaths) {
                if (superMultiPath!!.isAssociatedToPointer(idPointer)) {
                    return superMultiPath
                }
            }
            return null
        }

        fun addLinePathWithPointer(idPointer: Int): LinePath? {
            for (superMultiPath in superMultiPaths) {
                if (superMultiPath!!.isDisassociatedFromPointer) {
                    superMultiPath.associateToPointer(idPointer)
                    return superMultiPath
                }
            }
            return null
        }

        init {
            for (i in 0 until maxPointers) {
                superMultiPaths[i] = LinePath()
            }
        }
    }

    init {
        id = R.id.CanvasId
        val size = Point(1200, 800)
        mBitmapGrid = Bitmap.createBitmap(size.x, size.y, Bitmap.Config.ARGB_8888)
        mBitmapBackground = Bitmap.createBitmap(size.x, size.y, Bitmap.Config.ARGB_8888)
        mBitmap = Bitmap.createBitmap(
            size.x, size.y,
            Bitmap.Config.ARGB_8888
        )
        mCanvas = Canvas(mBitmap)
        mBitmapPaint = Paint(Paint.DITHER_FLAG)
        multiLinePathManager = MultiLinePathManager(MAX_POINTERS)
        serverPathManager = MultiLinePathManager(MAX_POINTERS)
    }
}
