#!/usr/bin/env node

/**
 * Test script para verificar el sistema de autenticación
 * Ejecutar: node test-auth.js
 */

async function test() {
  console.log("\\n🔍 Iniciando test de autenticación...\\n")

  // Test 1: Verificar variables de entorno
  console.log("1️⃣ Verificando variables de entorno...")
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.error(
      "❌ ERROR: Falta configurar UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN en .env.local"
    )
    process.exit(1)
  }
  console.log("✅ Variables de entorno configuradas")

  // Test 2: Conectar a Redis
  console.log("\\n2️⃣ Conectando a Upstash Redis...")
  try {
    const { Redis } = await import("@upstash/redis")
    const redis = new Redis({ url, token })

    const testKey = `test:${Date.now()}`
    const testValue = "hello"

    await redis.set(testKey, testValue)
    const result = await redis.get(testKey)

    if (result === testValue) {
      console.log("✅ Redis funciona correctamente")
      await redis.del(testKey)
    } else {
      throw new Error(`Set/Get mismatch: esperado "${testValue}", recibido "${result}"`)
    }
  } catch (err) {
    console.error("❌ ERROR conectando a Redis:", err.message)
    process.exit(1)
  }

  // Test 3: Verificar bcryptjs
  console.log("\\n3️⃣ Verificando bcryptjs...")
  try {
    const bcrypt = await import("bcryptjs")
    const plain = "password123"
    const hash = await bcrypt.default.hash(plain, 12)
    const valid = await bcrypt.default.compare(plain, hash)

    if (valid) {
      console.log("✅ bcryptjs funciona correctamente")
    } else {
      throw new Error("Hash/Compare mismatch")
    }
  } catch (err) {
    console.error("❌ ERROR con bcryptjs:", err.message)
    process.exit(1)
  }

  console.log("\\n✅ Todos los tests pasaron!")
  console.log("\\n📝 Pasos para probar:")
  console.log("  1. npm run dev")
  console.log("  2. Abre http://localhost:3000")
  console.log('  3. Click en "Create account"')
  console.log("  4. Usa email: test@example.com, password: password123")
  console.log("  5. Revisa la terminal para ver los logs [AUTH]")
  console.log("\\n")
}

test().catch(console.error)
