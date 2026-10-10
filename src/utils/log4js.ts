import path from 'node:path'
import log4js from 'log4js'
import { formatLogValue } from './privacy'

const createLogConfig = (logPath: string) => {
  return {
    appenders: {
      access: {
        type: 'file',
        filename: path.join(logPath, 'access.log'),
        maxLogSize: 1024 * 1024 * 10,
        category: 'access',
        // compress: true,
        keepFileExt: true,
        numBackups: 10,
      },
      app: {
        type: 'file',
        filename: path.join(logPath, 'app.log'),
        maxLogSize: 10485760,
        backups: 10,
        keepFileExt: true,
      },
      errorFile: {
        type: 'file',
        filename: path.join(logPath, 'errors.log'),
      },
      errors: {
        type: 'logLevelFilter',
        level: 'ERROR',
        appender: 'errorFile',
      },
      console: {
        type: 'console',
      },
    },
    categories: {
      default: { appenders: ['app', 'errors', 'console'], level: 'DEBUG' },
      access: { appenders: ['access'], level: 'ALL' },
    },
  }
}


export const initLogger = () => {
  log4js.configure(createLogConfig(global.lx.logPath))
}


const privateLogger = (category: string) => {
  const logger = log4js.getLogger(category)
  for (const method of ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const) {
    const write = logger[method].bind(logger)
    logger[method] = (...values: unknown[]) => {
      const [message, ...args] = values.map(formatLogValue)
      write(message, ...args)
    }
  }
  return logger
}

export const startupLog = privateLogger('startup')
export const syncLog = privateLogger('sync')
export const accessLog = privateLogger('access')
