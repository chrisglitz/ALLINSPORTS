import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NFL Forecasting MVP - Data-Driven Pre-Game Analysis',
  description: 'Transparent, ethical NFL game forecasting with emphasis on data freshness and explainability. For informational purposes only.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🏈 NFL Forecasting MVP
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Data-driven pre-game analysis - For informational purposes only
            </p>
          </div>
        </header>

        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Disclaimer:</strong> This application is for informational and educational purposes only.
              Not betting advice. Gamble responsibly. If you have a gambling problem, call 1-800-522-4700.
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-sm text-gray-500 text-center">
              Built with transparency and ethical practices. All predictions are algorithmic outputs, not professional advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
