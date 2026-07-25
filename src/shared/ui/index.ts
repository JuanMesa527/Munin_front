/**
 * Barrel del design system (capa shared).
 *
 * Las features importan SIEMPRE desde aqui (`@shared/ui`) y nunca de un
 * archivo suelto: asi renombrar un primitivo no rompe cinco pantallas.
 */

export { Alert, type AlertProps, type AlertTone } from './alert';
export { Badge, type BadgeProps, type BadgeSize, type BadgeTone } from './badge';
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardPadding,
  type CardProps,
} from './card';
export {
  ChatBubble,
  type ChatBubbleProps,
  type Emisor,
  type EstadoEnvio,
} from './chat-bubble';
export {
  ConsentNotice,
  POLITICA_VERSION_DEFECTO,
  RUTA_POLITICA,
  type ConsentNoticeProps,
} from './consent-notice';
export { EmptyState, type EmptyStateProps } from './empty-state';
export { FactorBars, type FactorBarsProps } from './factor-bars';
export { Field, FIELD_CONTROL_CLASS, type FieldProps } from './field';
export { Modal, type ModalProps, type ModalSize } from './modal';
export { PageHeader, type PageHeaderProps } from './page-header';
export {
  ProgressBar,
  type ProgressBarProps,
  type ProgressSize,
  type ProgressTone,
} from './progress-bar';
export { QuickReplies, type QuickRepliesProps } from './quick-replies';
export {
  ScoreGauge,
  type GaugeSize,
  type GaugeTone,
  type ScoreGaugeProps,
} from './score-gauge';
export { Skeleton, type SkeletonProps, type SkeletonVariant } from './skeleton';
export { Spinner, type SpinnerProps, type SpinnerSize } from './spinner';
export { Stat, type StatProps, type StatTrend } from './stat';
export { Tooltip, type TooltipProps, type TooltipSide } from './tooltip';
export { TypingIndicator, type TypingIndicatorProps } from './typing-indicator';
