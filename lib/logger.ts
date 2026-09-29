type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string | null;
  error?: unknown;
  [key: string]: unknown;
}

class Logger {
  private log(payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${payload.level.toUpperCase()}]${
      payload.context ? ` [${payload.context}]` : ""
    }${payload.userId ? ` [User:${payload.userId}]` : ""} ${payload.message}`;

    const logData = { ...payload, timestamp };

    // In a real production environment, you would send this to DataDog, Sentry, Axiom, etc.
    switch (payload.level) {
      case "error":
        console.error(formattedMessage, logData.error || "");
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  info(message: string, meta?: Omit<LogPayload, "level" | "message">) {
    this.log({ level: "info", message, ...meta });
  }

  warn(message: string, meta?: Omit<LogPayload, "level" | "message">) {
    this.log({ level: "warn", message, ...meta });
  }

  error(message: string, meta?: Omit<LogPayload, "level" | "message">) {
    this.log({ level: "error", message, ...meta });
  }

  debug(message: string, meta?: Omit<LogPayload, "level" | "message">) {
    this.log({ level: "debug", message, ...meta });
  }
}

export const logger = new Logger();
