import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RouteErrorPage } from './pages'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() { return this.state.hasError ? <RouteErrorPage /> : this.props.children }
}
