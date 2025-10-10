export const setupErrorHandlers = (): void => {
  process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason)
  })

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err)
    process.exit(1)
  })
}

export const validateEnvironment = (): void => {
  const requiredEnvVars = ['OPENROUTER_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }
}

export const logServerStart = (port: number): void => {
  console.log(`✅ Quick Air AI Agent running on http://localhost:${port}`)
}
