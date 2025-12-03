import { Component } from 'react';
import { colors, darkShadows, borderRadius, spacing } from '../lib/theme';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 *
 * @see PLAN.md Phase 0.4 for documentation
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // Could send to error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>⚠️</span>
            </div>

            <h1 style={styles.title}>Something went wrong</h1>

            <p style={styles.message}>
              An unexpected error occurred. Your work has been auto-saved.
            </p>

            {this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.buttonContainer}>
              <button
                onClick={this.handleReset}
                style={styles.secondaryButton}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={styles.primaryButton}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.bgDark,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.bgMedium,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: darkShadows.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: '64px',
  },
  title: {
    color: colors.textPrimary,
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: spacing.md,
    margin: 0,
  },
  message: {
    color: colors.textSecondary,
    fontSize: '16px',
    marginBottom: spacing.xl,
    lineHeight: 1.5,
  },
  details: {
    textAlign: 'left',
    marginBottom: spacing.xl,
    backgroundColor: colors.bgDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summary: {
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.md,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.textMuted}`,
    borderRadius: borderRadius.md,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
  },
};

export default ErrorBoundary;
