import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component prop1={pageProps.prop1} prop2={pageProps.prop2} />;
}
