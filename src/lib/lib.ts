class AssertionError extends Error {

}

export function ASSERT(condition: unknown, msg?: string): asserts condition {
    if (!condition) {
        throw new AssertionError(msg);
    }
}
