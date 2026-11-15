import type { FC } from 'react'
type DemoProps = { forcePhase?: number; interval?: number; hold?: number; className?: string }
export const ReceptionistDemo: FC<DemoProps>
export const QuoteDemo: FC<DemoProps>
export const InvoiceDemo: FC<DemoProps>
export const InboxDemo: FC<DemoProps>
export const DocumentDemo: FC<DemoProps>
export const ReportingDemo: FC<DemoProps>
export const DemoFrame: FC<any>
export function useDemoSteps(n: number, o?: object): any
