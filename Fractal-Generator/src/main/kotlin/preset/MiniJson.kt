package preset

/** Tiny JSON reader for preset files: objects, strings, numbers, booleans and null. */
internal class MiniJson(private val source: String) {
    private var i = 0

    fun parseObject(): Map<String, Any?> {
        skip(); expect('{'); skip()
        val out = linkedMapOf<String, Any?>()
        if (peek() == '}') { i++; return out }
        while (true) {
            skip(); val key = string(); skip(); expect(':'); skip()
            out[key] = value(); skip()
            when (peek()) {
                ',' -> { i++; continue }
                '}' -> { i++; return out }
                else -> error("Expected ',' or '}' at $i")
            }
        }
    }

    private fun value(): Any? = when (peek()) {
        '{' -> parseObject()
        '"' -> string()
        't' -> literal("true", true)
        'f' -> literal("false", false)
        'n' -> literal("null", null)
        else -> number()
    }

    private fun string(): String {
        expect('"'); val b = StringBuilder()
        while (i < source.length) {
            val c = source[i++]
            when (c) {
                '"' -> return b.toString()
                '\\' -> {
                    val e = source[i++]
                    b.append(when (e) { '"' -> '"'; '\\' -> '\\'; '/' -> '/'; 'b' -> '\b'; 'f' -> '\u000C'; 'n' -> '\n'; 'r' -> '\r'; 't' -> '\t'; else -> error("Unsupported escape \\$e") })
                }
                else -> b.append(c)
            }
        }
        error("Unterminated string")
    }

    private fun number(): Double {
        val start = i
        while (i < source.length && source[i] in "-+0123456789.eE") i++
        return source.substring(start, i).toDouble()
    }

    private fun <T> literal(text: String, value: T): T {
        require(source.startsWith(text, i)) { "Expected $text at $i" }
        i += text.length
        return value
    }

    private fun expect(c: Char) { require(peek() == c) { "Expected '$c' at $i" }; i++ }
    private fun peek(): Char { skip(); return source.getOrElse(i) { '\u0000' } }
    private fun skip() { while (i < source.length && source[i].isWhitespace()) i++ }
}
