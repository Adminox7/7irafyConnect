import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    // Log to console for visibility during dev
    console.error(err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto max-w-screen-md my-10 p-6 rounded-2xl border text-center">
          <h2 className="text-xl font-semibold mb-2">وقع خطأ غير متوقع</h2>
          <p className="text-slate-600 mb-4">حاول تحديث الصفحة أو الرجوع لاحقًا.</p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700"
          >
            إعادة التحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
