// Rejects if `promise` does not settle in `ms`. Redis commands queue forever while Redis is down,
// which would hang a request; callers use this to fall back instead.
export default function withTimeout(promise, ms = 1500, label = "operation") {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
