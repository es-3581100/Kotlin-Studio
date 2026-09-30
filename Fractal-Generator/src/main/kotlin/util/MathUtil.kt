package util

fun Double.clamp(min: Double, max: Double): Double = when {
    this < min -> min
    this > max -> max
    else -> this
}

fun Int.wrap(size: Int): Int {
    require(size > 0)
    val r = this % size
    return if (r < 0) r + size else r
}
