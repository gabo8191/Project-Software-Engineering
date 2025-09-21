package logger

import (
	"os"
	"strings"

	"github.com/sirupsen/logrus"
)

type Logger struct {
	*logrus.Logger
}

func New(level string) *Logger {
	log := logrus.New()

	// Set output to stdout
	log.SetOutput(os.Stdout)

	// Set log level
	switch strings.ToLower(level) {
	case "debug":
		log.SetLevel(logrus.DebugLevel)
	case "info":
		log.SetLevel(logrus.InfoLevel)
	case "warn", "warning":
		log.SetLevel(logrus.WarnLevel)
	case "error":
		log.SetLevel(logrus.ErrorLevel)
	default:
		log.SetLevel(logrus.InfoLevel)
	}

	// Set JSON formatter for structured logging
	log.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})

	return &Logger{Logger: log}
}

// Info logs an info message with fields
func (l *Logger) Info(msg string, fields ...interface{}) {
	if len(fields) > 0 {
		// Convert fields to map
		fieldMap := make(map[string]interface{})
		for i := 0; i < len(fields); i += 2 {
			if i+1 < len(fields) {
				key, ok := fields[i].(string)
				if ok {
					fieldMap[key] = fields[i+1]
				}
			}
		}
		l.Logger.WithFields(fieldMap).Info(msg)
	} else {
		l.Logger.Info(msg)
	}
}

// Error logs an error message with fields
func (l *Logger) Error(msg string, fields ...interface{}) {
	if len(fields) > 0 {
		// Convert fields to map
		fieldMap := make(map[string]interface{})
		for i := 0; i < len(fields); i += 2 {
			if i+1 < len(fields) {
				key, ok := fields[i].(string)
				if ok {
					fieldMap[key] = fields[i+1]
				}
			}
		}
		l.Logger.WithFields(fieldMap).Error(msg)
	} else {
		l.Logger.Error(msg)
	}
}

// Warn logs a warning message with fields
func (l *Logger) Warn(msg string, fields ...interface{}) {
	if len(fields) > 0 {
		// Convert fields to map
		fieldMap := make(map[string]interface{})
		for i := 0; i < len(fields); i += 2 {
			if i+1 < len(fields) {
				key, ok := fields[i].(string)
				if ok {
					fieldMap[key] = fields[i+1]
				}
			}
		}
		l.Logger.WithFields(fieldMap).Warn(msg)
	} else {
		l.Logger.Warn(msg)
	}
}

// Debug logs a debug message with fields
func (l *Logger) Debug(msg string, fields ...interface{}) {
	if len(fields) > 0 {
		// Convert fields to map
		fieldMap := make(map[string]interface{})
		for i := 0; i < len(fields); i += 2 {
			if i+1 < len(fields) {
				key, ok := fields[i].(string)
				if ok {
					fieldMap[key] = fields[i+1]
				}
			}
		}
		l.Logger.WithFields(fieldMap).Debug(msg)
	} else {
		l.Logger.Debug(msg)
	}
}
