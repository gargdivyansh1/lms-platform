const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.log(`🔄 Reconnecting in ${delay} ms`);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("✅ CONNECT");
});

redis.on("ready", () => {
  console.log("✅ READY");
});

redis.on("close", () => {
  console.log("❌ CLOSE");
});

redis.on("reconnecting", () => {
  console.log("🔄 RECONNECTING");
});

redis.on("end", () => {
  console.log("🛑 END");
});

redis.on("error", (err) => {
  console.log("❌ ERROR", err.code, err.message);
});

module.exports = redis;