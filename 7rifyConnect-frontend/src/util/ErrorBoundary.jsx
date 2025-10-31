import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Could report to an error tracker here
    // console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-10 rounded-2xl border bg-white p-6 text-center">
          <div className="text-xl font-semibold mb-2">وقع خطأ غير متوقع</div>
          <div className="text-slate-600 text-sm">حاول تحديث الصفحة أو الرجوع لاحقاً.</div>
        </div>
      );
    }
    return this.props.children;
  }
}
