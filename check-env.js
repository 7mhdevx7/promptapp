#!/usr/bin/env node
const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN
const secret = process.env.NEXTAUTH_SECRET
const authUrl = process.env.NEXTAUTH_URL

console.log("\\n📋 DIAGNOSTICO DE VARIABLES DE ENTORNO:\\n")
console.log("UPSTASH_REDIS_REST_URL:", url ? "✅ EXISTE" : "❌ NO EXISTE")
console.log("UPSTASH_REDIS_REST_TOKEN:", token ? "✅ EXISTE" : "❌ NO EXISTE")
console.log("NEXTAUTH_SECRET:", secret ? "✅ EXISTE" : "❌ NO EXISTE")
console.log("NEXTAUTH_URL:", authUrl ? `✅ ${authUrl}` : "❌ NO EXISTE")

if (!url || !token) {
  console.log("\\n❌ ERROR: Faltan variables de Upstash")
  console.log("\\nSolución:")
  console.log("1. cat .env.local  (verifica que exista)")
  console.log("2. npm run dev  (después detén con Ctrl+C y reinicia)")
  process.exit(1)
}

console.log("\\n✅ Todas las variables están configuradas")
console.log("\\nPrueba: npm run dev\\n")
